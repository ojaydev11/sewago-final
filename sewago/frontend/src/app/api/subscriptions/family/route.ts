import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const createFamilyPlanSchema = z.object({
  ownerId: z.string(),
  tier: z.enum(['PLUS', 'PRO']),
  paymentMethod: z.string(),
});

const inviteFamilyMemberSchema = z.object({
  familyPlanId: z.string(),
  email: z.string().email(),
  invitedBy: z.string(),
});

// GET /api/subscriptions/family - Get family plan details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const familyPlanId = searchParams.get('familyPlanId');

    if (familyPlanId) {
      const familyPlan = await prisma.familyPlan.findUnique({
        where: { id: familyPlanId },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          subscriptions: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          invitations: {
            where: { status: 'PENDING' },
            include: {
              inviter: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      return NextResponse.json(familyPlan);
    }

    if (userId) {
      // Check if user owns a family plan
      const ownedPlan = await prisma.familyPlan.findUnique({
        where: { ownerId: userId },
        include: {
          subscriptions: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          invitations: {
            where: { status: 'PENDING' }
          }
        }
      });

      if (ownedPlan) {
        return NextResponse.json(ownedPlan);
      }

      // Check if user is part of a family plan
      const userSubscription = await prisma.subscription.findUnique({
        where: { userId },
        include: {
          familyPlan: {
            include: {
              owner: {
                select: { id: true, name: true, email: true }
              },
              subscriptions: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true }
                  }
                }
              }
            }
          }
        }
      });

      return NextResponse.json(userSubscription?.familyPlan || null);
    }

    return NextResponse.json(
      { error: 'User ID or Family Plan ID is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching family plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family plan' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions/family - Create family plan or invite member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create') {
      return await createFamilyPlan(body);
    } else if (action === 'invite') {
      return await inviteFamilyMember(body);
    } else if (action === 'accept_invitation') {
      return await acceptFamilyInvitation(body);
    } else if (action === 'remove_member') {
      return await removeFamilyMember(body);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing family plan action:', error);
    return NextResponse.json(
      { error: 'Failed to process family plan action' },
      { status: 500 }
    );
  }
}

async function createFamilyPlan(body: any) {
  const validatedData = createFamilyPlanSchema.parse(body);
  const { ownerId, tier, paymentMethod } = validatedData;

  // Check if user already owns a family plan
  const existingPlan = await prisma.familyPlan.findUnique({
    where: { ownerId }
  });

  if (existingPlan) {
    return NextResponse.json(
      { error: 'User already owns a family plan' },
      { status: 400 }
    );
  }

  // Calculate family plan pricing
  const pricing = getFamilyPlanPricing(tier);
  const maxMembers = tier === 'PLUS' ? 4 : 6;

  // Create family plan and update owner's subscription
  const result = await prisma.$transaction(async (tx) => {
    const familyPlan = await tx.familyPlan.create({
      data: {
        ownerId,
        tier,
        maxMembers,
        currentMembers: 1,
        sharedCredits: tier === 'PLUS' ? 10000 : 25000, // Initial credits
      }
    });

    // Update owner's subscription to link to family plan
    await tx.subscription.update({
      where: { userId: ownerId },
      data: {
        tier,
        familyPlanId: familyPlan.id,
        status: 'ACTIVE',
        lastPayment: new Date(),
        nextBilling: getNextBillingDate(),
        paymentMethod,
      }
    });

    return familyPlan;
  });

  return NextResponse.json(result, { status: 201 });
}

async function inviteFamilyMember(body: any) {
  const validatedData = inviteFamilyMemberSchema.parse(body);
  const { familyPlanId, email, invitedBy } = validatedData;

  // Check if family plan exists and has space
  const familyPlan = await prisma.familyPlan.findUnique({
    where: { id: familyPlanId },
    include: {
      subscriptions: true,
      invitations: {
        where: { status: 'PENDING' }
      }
    }
  });

  if (!familyPlan) {
    return NextResponse.json(
      { error: 'Family plan not found' },
      { status: 404 }
    );
  }

  const totalMembers = familyPlan.subscriptions.length + familyPlan.invitations.length;
  if (totalMembers >= familyPlan.maxMembers) {
    return NextResponse.json(
      { error: 'Family plan is full' },
      { status: 400 }
    );
  }

  // Check if email is already invited or is a member
  const existingInvitation = familyPlan.invitations.find(inv => inv.email === email);
  const existingMember = await prisma.user.findUnique({
    where: { email },
    include: {
      subscription: {
        where: { familyPlanId }
      }
    }
  });

  if (existingInvitation || existingMember?.subscription) {
    return NextResponse.json(
      { error: 'User already invited or is a member' },
      { status: 400 }
    );
  }

  // Create invitation
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  const invitation = await prisma.familyInvitation.create({
    data: {
      familyPlanId,
      email,
      invitedBy,
      token,
      expiresAt,
    }
  });

  // Send invitation email (mock implementation)
  await sendFamilyInvitationEmail(email, token, familyPlan.tier);

  return NextResponse.json(invitation, { status: 201 });
}

async function acceptFamilyInvitation(body: any) {
  const { token, userId } = body;

  if (!token || !userId) {
    return NextResponse.json(
      { error: 'Token and User ID are required' },
      { status: 400 }
    );
  }

  // Find and validate invitation
  const invitation = await prisma.familyInvitation.findUnique({
    where: { token },
    include: {
      familyPlan: {
        include: {
          subscriptions: true
        }
      }
    }
  });

  if (!invitation || invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'Invalid or expired invitation' },
      { status: 400 }
    );
  }

  // Check if family plan has space
  if (invitation.familyPlan.subscriptions.length >= invitation.familyPlan.maxMembers) {
    return NextResponse.json(
      { error: 'Family plan is full' },
      { status: 400 }
    );
  }

  // Accept invitation and create/update subscription
  const result = await prisma.$transaction(async (tx) => {
    // Update invitation status
    await tx.familyInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' }
    });

    // Create or update user's subscription
    const subscription = await tx.subscription.upsert({
      where: { userId },
      create: {
        userId,
        tier: invitation.familyPlan.tier,
        status: 'ACTIVE',
        familyPlanId: invitation.familyPlan.id,
      },
      update: {
        tier: invitation.familyPlan.tier,
        status: 'ACTIVE',
        familyPlanId: invitation.familyPlan.id,
      }
    });

    // Update family plan member count
    await tx.familyPlan.update({
      where: { id: invitation.familyPlan.id },
      data: {
        currentMembers: {
          increment: 1
        }
      }
    });

    return subscription;
  });

  return NextResponse.json(result);
}

async function removeFamilyMember(body: any) {
  const { familyPlanId, userId, removedBy } = body;

  if (!familyPlanId || !userId || !removedBy) {
    return NextResponse.json(
      { error: 'Family Plan ID, User ID, and Removed By are required' },
      { status: 400 }
    );
  }

  // Verify the person removing has permission (must be family plan owner)
  const familyPlan = await prisma.familyPlan.findUnique({
    where: { id: familyPlanId }
  });

  if (!familyPlan || familyPlan.ownerId !== removedBy) {
    return NextResponse.json(
      { error: 'Only family plan owner can remove members' },
      { status: 403 }
    );
  }

  // Remove member
  const result = await prisma.$transaction(async (tx) => {
    // Update user's subscription to FREE tier and remove family plan
    await tx.subscription.update({
      where: { userId },
      data: {
        tier: 'FREE',
        familyPlanId: null,
      }
    });

    // Update family plan member count
    await tx.familyPlan.update({
      where: { id: familyPlanId },
      data: {
        currentMembers: {
          decrement: 1
        }
      }
    });

    return { success: true };
  });

  // Send removal notification
  await prisma.notification.create({
    data: {
      userId,
      message: 'You have been removed from the family plan. Your subscription has been downgraded to the free tier.',
      type: 'FAMILY_PLAN_REMOVAL',
      channel: 'APP'
    }
  });

  return NextResponse.json(result);
}

// Helper functions
function getFamilyPlanPricing(tier: 'PLUS' | 'PRO') {
  const pricing = {
    PLUS: 49900,  // NPR 499 in paisa
    PRO: 89900    // NPR 899 in paisa
  };
  
  return pricing[tier];
}

function getNextBillingDate(): Date {
  const nextBilling = new Date();
  nextBilling.setMonth(nextBilling.getMonth() + 1);
  return nextBilling;
}

async function sendFamilyInvitationEmail(email: string, token: string, tier: string) {
  // Mock email sending - in production, use actual email service
  console.log(`Sending family invitation email to ${email} for ${tier} plan with token ${token}`);
  
  // Create a notification for the invitation
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          message: `You've been invited to join a SewaGo ${tier} family plan! Check your email to accept the invitation.`,
          type: 'FAMILY_INVITATION',
          channel: 'APP'
        }
      });
    }
  } catch (error) {
    console.error('Error creating invitation notification:', error);
  }
}