import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Schema for joining a group booking
const joinGroupSchema = z.object({
  inviteCode: z.string().min(6).max(8),
  participantRole: z.enum(['MEMBER', 'VIEWER']).default('MEMBER')
});

// Schema for updating group booking
const updateGroupSchema = z.object({
  groupId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  maxParticipants: z.number().min(2).max(20).optional(),
  splitMethod: z.enum(['EQUAL', 'PERCENTAGE', 'CUSTOM', 'BY_SERVICE']).optional(),
  groupDiscount: z.number().min(0).max(50).optional()
});

// Schema for inviting participants
const inviteParticipantSchema = z.object({
  groupId: z.string(),
  invitations: z.array(z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    role: z.enum(['MEMBER', 'VIEWER']).default('MEMBER')
  }))
});

// Schema for updating participant
const updateParticipantSchema = z.object({
  participantId: z.string(),
  role: z.enum(['ORGANIZER', 'MEMBER', 'VIEWER']).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'DECLINED', 'REMOVED']).optional(),
  shareAmount: z.number().min(0).optional()
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const action = body.action;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'join':
        return handleJoinGroup(body, user);
      case 'invite':
        return handleInviteParticipants(body, user);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in group booking operation:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const inviteCode = searchParams.get('inviteCode');

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (groupId) {
      // Get specific group booking details
      return getGroupBookingDetails(groupId, user);
    } else if (inviteCode) {
      // Get group booking by invite code (for joining)
      return getGroupBookingByInviteCode(inviteCode);
    } else {
      // Get user's group bookings
      return getUserGroupBookings(user);
    }

  } catch (error) {
    console.error('Error fetching group booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const action = body.action;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'updateGroup':
        return handleUpdateGroup(body, user);
      case 'updateParticipant':
        return handleUpdateParticipant(body, user);
      case 'leaveGroup':
        return handleLeaveGroup(body.groupId, user);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error updating group booking:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleJoinGroup(body: any, user: any) {
  const data = joinGroupSchema.parse(body);
  
  // Find group booking by invite code
  const groupBooking = await prisma.groupBooking.findUnique({
    where: { 
      inviteCode: data.inviteCode,
      isActive: true
    },
    include: {
      participants: true,
      advancedBookings: {
        include: {
          booking: {
            include: { service: true }
          }
        }
      }
    }
  });

  if (!groupBooking) {
    return NextResponse.json(
      { error: 'Invalid invite code or group is not active' },
      { status: 404 }
    );
  }

  // Check if group is full
  if (groupBooking.currentCount >= groupBooking.maxParticipants) {
    return NextResponse.json(
      { error: 'Group is full' },
      { status: 400 }
    );
  }

  // Check if user is already a participant
  const existingParticipant = groupBooking.participants.find(p => p.userId === user.id);
  if (existingParticipant) {
    return NextResponse.json(
      { error: 'You are already a member of this group' },
      { status: 400 }
    );
  }

  // Check if invite has expired
  if (groupBooking.expiresAt && groupBooking.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'Group invite has expired' },
      { status: 400 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // Calculate user's share amount
    let shareAmount = 0;
    if (groupBooking.advancedBookings.length > 0) {
      const totalCost = groupBooking.advancedBookings.reduce(
        (sum, booking) => sum + booking.totalCost, 0
      );
      
      // Apply group discount
      const discountedCost = totalCost * (1 - groupBooking.groupDiscount / 100);
      
      // Calculate share based on split method
      shareAmount = calculateParticipantShare(
        discountedCost,
        groupBooking.currentCount + 1,
        groupBooking.splitMethod
      );
    }

    // Add participant
    const participant = await tx.bookingParticipant.create({
      data: {
        userId: user.id,
        groupBookingId: groupBooking.id,
        role: data.participantRole,
        status: 'CONFIRMED',
        shareAmount,
        paymentStatus: 'PENDING'
      }
    });

    // Update group member count
    const updatedGroup = await tx.groupBooking.update({
      where: { id: groupBooking.id },
      data: { 
        currentCount: groupBooking.currentCount + 1 
      }
    });

    // Create notification for group organizer
    const organizer = groupBooking.participants.find(p => p.role === 'ORGANIZER');
    if (organizer) {
      await tx.notification.create({
        data: {
          userId: organizer.userId,
          message: `${user.name || user.email} joined your group booking: ${groupBooking.title}`,
          type: 'GROUP_BOOKING_UPDATE',
          channel: 'IN_APP'
        }
      });
    }

    return { participant, groupBooking: updatedGroup };
  });

  return NextResponse.json({
    message: 'Successfully joined group booking',
    participant: result.participant,
    groupBooking: result.groupBooking
  });
}

async function handleInviteParticipants(body: any, user: any) {
  const data = inviteParticipantSchema.parse(body);
  
  // Check if user has permission to invite (must be organizer or member)
  const participant = await prisma.bookingParticipant.findFirst({
    where: {
      userId: user.id,
      groupBookingId: data.groupId,
      role: { in: ['ORGANIZER', 'MEMBER'] },
      status: 'CONFIRMED'
    },
    include: {
      groupBooking: true
    }
  });

  if (!participant) {
    return NextResponse.json(
      { error: 'You do not have permission to invite participants to this group' },
      { status: 403 }
    );
  }

  const invitations = [];
  const errors = [];

  for (const invitation of data.invitations) {
    try {
      // Check if user is already invited or participating
      const existingParticipant = await prisma.bookingParticipant.findFirst({
        where: {
          groupBookingId: data.groupId,
          user: { email: invitation.email }
        }
      });

      const existingInvitation = await prisma.groupInvitation.findFirst({
        where: {
          groupBookingId: data.groupId,
          invitedEmail: invitation.email,
          status: 'PENDING'
        }
      });

      if (existingParticipant) {
        errors.push(`${invitation.email} is already a participant`);
        continue;
      }

      if (existingInvitation) {
        errors.push(`${invitation.email} already has a pending invitation`);
        continue;
      }

      // Create invitation
      const groupInvitation = await prisma.groupInvitation.create({
        data: {
          groupBookingId: data.groupId,
          invitedBy: user.id,
          invitedEmail: invitation.email,
          invitedPhone: invitation.phone,
          token: generateInvitationToken(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });

      invitations.push(groupInvitation);

      // TODO: Send invitation email/SMS
      // await sendGroupInvitation(invitation.email, groupInvitation, participant.groupBooking);

    } catch (error) {
      console.error('Error creating invitation:', error);
      errors.push(`Failed to invite ${invitation.email}`);
    }
  }

  return NextResponse.json({
    message: `Sent ${invitations.length} invitations`,
    invitations,
    errors: errors.length > 0 ? errors : undefined
  });
}

async function handleUpdateGroup(body: any, user: any) {
  const data = updateGroupSchema.parse(body);
  
  // Check if user is the organizer
  const participant = await prisma.bookingParticipant.findFirst({
    where: {
      userId: user.id,
      groupBookingId: data.groupId,
      role: 'ORGANIZER',
      status: 'CONFIRMED'
    }
  });

  if (!participant) {
    return NextResponse.json(
      { error: 'Only group organizers can update group settings' },
      { status: 403 }
    );
  }

  const updatedGroup = await prisma.groupBooking.update({
    where: { id: data.groupId },
    data: {
      title: data.title,
      description: data.description,
      maxParticipants: data.maxParticipants,
      splitMethod: data.splitMethod,
      groupDiscount: data.groupDiscount
    }
  });

  // If split method or discount changed, recalculate participant shares
  if (data.splitMethod || data.groupDiscount !== undefined) {
    await recalculateParticipantShares(data.groupId, updatedGroup);
  }

  return NextResponse.json({
    message: 'Group booking updated successfully',
    groupBooking: updatedGroup
  });
}

async function handleUpdateParticipant(body: any, user: any) {
  const data = updateParticipantSchema.parse(body);
  
  // Get participant details
  const participant = await prisma.bookingParticipant.findUnique({
    where: { id: data.participantId },
    include: {
      user: true,
      groupBooking: true
    }
  });

  if (!participant) {
    return NextResponse.json(
      { error: 'Participant not found' },
      { status: 404 }
    );
  }

  // Check permissions
  const userParticipant = await prisma.bookingParticipant.findFirst({
    where: {
      userId: user.id,
      groupBookingId: participant.groupBookingId,
      role: { in: ['ORGANIZER'] }
    }
  });

  // Users can update their own status, but only organizers can update others
  if (participant.userId !== user.id && !userParticipant) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  const updatedParticipant = await prisma.bookingParticipant.update({
    where: { id: data.participantId },
    data: {
      role: data.role,
      status: data.status,
      shareAmount: data.shareAmount
    }
  });

  // Handle status changes
  if (data.status === 'DECLINED' || data.status === 'REMOVED') {
    // Update group member count
    await prisma.groupBooking.update({
      where: { id: participant.groupBookingId },
      data: { 
        currentCount: { decrement: 1 }
      }
    });
  }

  return NextResponse.json({
    message: 'Participant updated successfully',
    participant: updatedParticipant
  });
}

async function handleLeaveGroup(groupId: string, user: any) {
  const participant = await prisma.bookingParticipant.findFirst({
    where: {
      userId: user.id,
      groupBookingId: groupId,
      status: { in: ['PENDING', 'CONFIRMED'] }
    },
    include: {
      groupBooking: true
    }
  });

  if (!participant) {
    return NextResponse.json(
      { error: 'You are not a participant in this group' },
      { status: 404 }
    );
  }

  // Organizers cannot leave unless they transfer ownership or cancel the group
  if (participant.role === 'ORGANIZER') {
    return NextResponse.json(
      { error: 'Group organizers cannot leave. Please transfer ownership or cancel the group.' },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    // Remove participant
    await tx.bookingParticipant.update({
      where: { id: participant.id },
      data: { status: 'REMOVED' }
    });

    // Update group member count
    await tx.groupBooking.update({
      where: { id: groupId },
      data: { 
        currentCount: { decrement: 1 }
      }
    });
  });

  return NextResponse.json({
    message: 'Successfully left the group booking'
  });
}

async function getGroupBookingDetails(groupId: string, user: any) {
  // Check if user is a participant
  const participant = await prisma.bookingParticipant.findFirst({
    where: {
      userId: user.id,
      groupBookingId: groupId
    }
  });

  if (!participant) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }

  const groupBooking = await prisma.groupBooking.findUnique({
    where: { id: groupId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: [
          { role: 'asc' }, // Organizer first
          { joinedAt: 'asc' }
        ]
      },
      advancedBookings: {
        include: {
          booking: {
            include: {
              service: true,
              provider: true
            }
          }
        }
      },
      invitations: {
        where: { status: 'PENDING' },
        orderBy: { sentAt: 'desc' }
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { sentAt: 'desc' },
        take: 50
      }
    }
  });

  return NextResponse.json({
    groupBooking,
    userParticipant: participant
  });
}

async function getGroupBookingByInviteCode(inviteCode: string) {
  const groupBooking = await prisma.groupBooking.findUnique({
    where: { 
      inviteCode,
      isActive: true
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        where: {
          status: { in: ['CONFIRMED', 'PENDING'] }
        }
      },
      advancedBookings: {
        include: {
          booking: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  basePrice: true,
                  category: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!groupBooking) {
    return NextResponse.json(
      { error: 'Invalid invite code' },
      { status: 404 }
    );
  }

  // Check if invite has expired
  if (groupBooking.expiresAt && groupBooking.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'Invite has expired' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    groupBooking: {
      ...groupBooking,
      // Don't expose sensitive information to non-participants
      invitations: undefined
    }
  });
}

async function getUserGroupBookings(user: any) {
  const groupBookings = await prisma.groupBooking.findMany({
    where: {
      participants: {
        some: {
          userId: user.id,
          status: { in: ['CONFIRMED', 'PENDING'] }
        }
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      },
      advancedBookings: {
        include: {
          booking: {
            include: {
              service: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({
    groupBookings,
    total: groupBookings.length
  });
}

// Helper functions
function calculateParticipantShare(
  totalCost: number,
  participantCount: number,
  splitMethod: string
): number {
  switch (splitMethod) {
    case 'EQUAL':
      return Math.floor(totalCost / participantCount);
    case 'BY_SERVICE':
      // This would be calculated based on which services each participant is booking
      return Math.floor(totalCost / participantCount);
    default:
      return Math.floor(totalCost / participantCount);
  }
}

async function recalculateParticipantShares(
  groupId: string,
  groupBooking: any
) {
  const participants = await prisma.bookingParticipant.findMany({
    where: {
      groupBookingId: groupId,
      status: 'CONFIRMED'
    }
  });

  // Get total cost from advanced bookings
  const advancedBookings = await prisma.advancedBooking.findMany({
    where: { groupId }
  });

  const totalCost = advancedBookings.reduce(
    (sum, booking) => sum + booking.totalCost, 0
  );

  const discountedCost = totalCost * (1 - groupBooking.groupDiscount / 100);

  // Recalculate shares for each participant
  for (const participant of participants) {
    const shareAmount = calculateParticipantShare(
      discountedCost,
      participants.length,
      groupBooking.splitMethod
    );

    await prisma.bookingParticipant.update({
      where: { id: participant.id },
      data: { shareAmount }
    });
  }
}

function generateInvitationToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}