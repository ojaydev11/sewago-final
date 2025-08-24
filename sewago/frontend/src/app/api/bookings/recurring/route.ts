import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Schema for creating recurring booking
const createRecurringSchema = z.object({
  serviceId: z.string(),
  providerId: z.string().optional(),
  address: z.string(),
  notes: z.string().optional(),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM']),
  interval: z.number().min(1).max(12).default(1),
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  preferredTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  autoRebook: z.boolean().default(true),
  holidayHandling: z.enum(['SKIP', 'RESCHEDULE_BEFORE', 'RESCHEDULE_AFTER']).default('RESCHEDULE_AFTER'),
  weatherSensitive: z.boolean().default(false),
  maxBookings: z.number().min(1).max(52).optional() // Max 52 weeks worth
});

// Schema for updating recurring booking
const updateRecurringSchema = z.object({
  id: z.string(),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM']).optional(),
  interval: z.number().min(1).max(12).optional(),
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  preferredTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  autoRebook: z.boolean().optional(),
  holidayHandling: z.enum(['SKIP', 'RESCHEDULE_BEFORE', 'RESCHEDULE_AFTER']).optional(),
  weatherSensitive: z.boolean().optional()
});

// Schema for manual schedule adjustment
const scheduleAdjustmentSchema = z.object({
  recurringBookingId: z.string(),
  originalDate: z.string().datetime(),
  newDate: z.string().datetime().optional(),
  reason: z.string(),
  type: z.enum(['HOLIDAY', 'WEATHER', 'PROVIDER_UNAVAILABLE', 'USER_REQUEST', 'SYSTEM_OPTIMIZATION'])
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
    const action = body.action || 'create';

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
      case 'create':
        return handleCreateRecurring(body, user);
      case 'adjust':
        return handleScheduleAdjustment(body, user);
      case 'generate_next':
        return handleGenerateNextBooking(body.recurringId, user);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in recurring booking operation:', error);
    
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
    const recurringId = searchParams.get('recurringId');
    const status = searchParams.get('status') || 'active';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (recurringId) {
      return getRecurringBookingDetails(recurringId, user);
    } else {
      return getUserRecurringBookings(user, status, page, limit);
    }

  } catch (error) {
    console.error('Error fetching recurring bookings:', error);
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
    const data = updateRecurringSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return handleUpdateRecurring(data, user);

  } catch (error) {
    console.error('Error updating recurring booking:', error);
    
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

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const recurringId = searchParams.get('recurringId');
    const cancelFuture = searchParams.get('cancelFuture') === 'true';

    if (!recurringId) {
      return NextResponse.json(
        { error: 'Recurring booking ID required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return handleCancelRecurring(recurringId, user, cancelFuture);

  } catch (error) {
    console.error('Error cancelling recurring booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleCreateRecurring(body: any, user: any) {
  const data = createRecurringSchema.parse(body);

  // Validate service exists
  const service = await prisma.service.findUnique({
    where: { id: data.serviceId }
  });

  if (!service) {
    return NextResponse.json(
      { error: 'Service not found' },
      { status: 404 }
    );
  }

  // Validate provider if specified
  if (data.providerId) {
    const provider = await prisma.provider.findUnique({
      where: { id: data.providerId }
    });

    if (!provider || !provider.verified) {
      return NextResponse.json(
        { error: 'Provider not found or not verified' },
        { status: 404 }
      );
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    // Create recurring booking
    const recurringBooking = await tx.recurringBooking.create({
      data: {
        userId: user.id,
        serviceId: data.serviceId,
        providerId: data.providerId,
        frequency: data.frequency,
        interval: data.interval,
        dayOfWeek: data.dayOfWeek,
        dayOfMonth: data.dayOfMonth,
        preferredTime: data.preferredTime,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        nextBooking: calculateNextBookingDate(data),
        isActive: true
      }
    });

    // Create the first booking immediately
    const firstBooking = await tx.booking.create({
      data: {
        userId: user.id,
        serviceId: data.serviceId,
        providerId: data.providerId,
        address: data.address,
        notes: data.notes,
        total: service.basePrice,
        scheduledAt: new Date(data.startDate),
        status: 'PENDING_CONFIRMATION'
      }
    });

    // Create advanced booking link
    const advancedBooking = await tx.advancedBooking.create({
      data: {
        bookingId: firstBooking.id,
        type: 'RECURRING',
        organizerId: user.id,
        recurringId: recurringBooking.id,
        smartScheduled: false,
        weatherSensitive: data.weatherSensitive,
        totalCost: service.basePrice
      }
    });

    // Generate future bookings if auto-rebook is enabled
    if (data.autoRebook) {
      await generateFutureBookings(tx, recurringBooking, data, service, user);
    }

    return { recurringBooking, firstBooking, advancedBooking };
  });

  return NextResponse.json({
    message: 'Recurring booking created successfully',
    recurringBooking: result.recurringBooking,
    firstBooking: result.firstBooking
  }, { status: 201 });
}

async function handleUpdateRecurring(data: any, user: any) {
  // Check ownership
  const recurringBooking = await prisma.recurringBooking.findFirst({
    where: {
      id: data.id,
      userId: user.id
    }
  });

  if (!recurringBooking) {
    return NextResponse.json(
      { error: 'Recurring booking not found or access denied' },
      { status: 404 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // Update recurring booking
    const updated = await tx.recurringBooking.update({
      where: { id: data.id },
      data: {
        frequency: data.frequency,
        interval: data.interval,
        dayOfWeek: data.dayOfWeek,
        dayOfMonth: data.dayOfMonth,
        preferredTime: data.preferredTime,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        isActive: data.isActive,
        nextBooking: data.frequency ? calculateNextBookingDate({
          ...recurringBooking,
          ...data,
          startDate: recurringBooking.lastBooking || recurringBooking.startDate
        }) : undefined
      }
    });

    // If frequency or timing changed, update future bookings
    if (data.frequency || data.interval || data.dayOfWeek || data.dayOfMonth || data.preferredTime) {
      await updateFutureBookings(tx, updated);
    }

    return updated;
  });

  return NextResponse.json({
    message: 'Recurring booking updated successfully',
    recurringBooking: result
  });
}

async function handleScheduleAdjustment(body: any, user: any) {
  const data = scheduleAdjustmentSchema.parse(body);

  // Check ownership
  const recurringBooking = await prisma.recurringBooking.findFirst({
    where: {
      id: data.recurringBookingId,
      userId: user.id
    }
  });

  if (!recurringBooking) {
    return NextResponse.json(
      { error: 'Recurring booking not found or access denied' },
      { status: 404 }
    );
  }

  const adjustment = await prisma.scheduleAdjustment.create({
    data: {
      recurringBookingId: data.recurringBookingId,
      originalDate: new Date(data.originalDate),
      newDate: data.newDate ? new Date(data.newDate) : null,
      reason: data.reason,
      type: data.type,
      isApproved: data.type === 'USER_REQUEST' // Auto-approve user requests
    }
  });

  // If there's a new date, update the corresponding booking
  if (data.newDate) {
    const booking = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        scheduledAt: new Date(data.originalDate),
        advancedBooking: {
          recurringId: data.recurringBookingId
        }
      }
    });

    if (booking) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          scheduledAt: new Date(data.newDate),
          notes: `${booking.notes || ''}\n\nRescheduled: ${data.reason}`.trim()
        }
      });
    }
  }

  return NextResponse.json({
    message: 'Schedule adjustment created successfully',
    adjustment
  });
}

async function handleGenerateNextBooking(recurringId: string, user: any) {
  const recurringBooking = await prisma.recurringBooking.findFirst({
    where: {
      id: recurringId,
      userId: user.id,
      isActive: true
    },
    include: {
      service: true
    }
  });

  if (!recurringBooking) {
    return NextResponse.json(
      { error: 'Recurring booking not found or inactive' },
      { status: 404 }
    );
  }

  if (!recurringBooking.nextBooking) {
    return NextResponse.json(
      { error: 'No next booking scheduled' },
      { status: 400 }
    );
  }

  // Check if it's time to generate the next booking
  const now = new Date();
  const timeUntilNext = recurringBooking.nextBooking.getTime() - now.getTime();
  const hoursUntilNext = timeUntilNext / (1000 * 60 * 60);

  if (hoursUntilNext > 24) {
    return NextResponse.json(
      { error: 'Too early to generate next booking' },
      { status: 400 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // Create next booking
    const nextBooking = await tx.booking.create({
      data: {
        userId: user.id,
        serviceId: recurringBooking.serviceId,
        providerId: recurringBooking.providerId,
        address: 'Same as previous', // This should be stored with recurring booking
        notes: 'Automatically generated recurring booking',
        total: recurringBooking.service.basePrice,
        scheduledAt: recurringBooking.nextBooking,
        status: 'PENDING_CONFIRMATION'
      }
    });

    // Create advanced booking link
    const advancedBooking = await tx.advancedBooking.create({
      data: {
        bookingId: nextBooking.id,
        type: 'RECURRING',
        organizerId: user.id,
        recurringId: recurringBooking.id,
        smartScheduled: false,
        totalCost: recurringBooking.service.basePrice
      }
    });

    // Update recurring booking
    const updatedRecurring = await tx.recurringBooking.update({
      where: { id: recurringId },
      data: {
        lastBooking: recurringBooking.nextBooking,
        nextBooking: calculateNextBookingDate({
          ...recurringBooking,
          startDate: recurringBooking.nextBooking
        }),
        totalBookings: recurringBooking.totalBookings + 1
      }
    });

    return { nextBooking, advancedBooking, recurringBooking: updatedRecurring };
  });

  return NextResponse.json({
    message: 'Next booking generated successfully',
    booking: result.nextBooking,
    recurringBooking: result.recurringBooking
  });
}

async function handleCancelRecurring(recurringId: string, user: any, cancelFuture: boolean) {
  const recurringBooking = await prisma.recurringBooking.findFirst({
    where: {
      id: recurringId,
      userId: user.id
    }
  });

  if (!recurringBooking) {
    return NextResponse.json(
      { error: 'Recurring booking not found or access denied' },
      { status: 404 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // Deactivate recurring booking
    const updated = await tx.recurringBooking.update({
      where: { id: recurringId },
      data: { 
        isActive: false,
        nextBooking: null
      }
    });

    if (cancelFuture) {
      // Cancel all future bookings
      const futureBookings = await tx.booking.findMany({
        where: {
          userId: user.id,
          scheduledAt: { gte: new Date() },
          status: { in: ['PENDING_CONFIRMATION', 'CONFIRMED'] },
          advancedBooking: {
            recurringId: recurringId
          }
        }
      });

      for (const booking of futureBookings) {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELED' }
        });
      }

      return { recurringBooking: updated, cancelledBookings: futureBookings.length };
    }

    return { recurringBooking: updated, cancelledBookings: 0 };
  });

  return NextResponse.json({
    message: 'Recurring booking cancelled successfully',
    recurringBooking: result.recurringBooking,
    cancelledFutureBookings: result.cancelledBookings
  });
}

async function getRecurringBookingDetails(recurringId: string, user: any) {
  const recurringBooking = await prisma.recurringBooking.findFirst({
    where: {
      id: recurringId,
      userId: user.id
    },
    include: {
      service: true,
      provider: {
        select: {
          id: true,
          name: true,
          verified: true,
          tier: true,
          onTimePct: true,
          completionPct: true
        }
      },
      advancedBookings: {
        include: {
          booking: {
            include: {
              review: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      scheduleAdjustments: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }
    }
  });

  if (!recurringBooking) {
    return NextResponse.json(
      { error: 'Recurring booking not found' },
      { status: 404 }
    );
  }

  // Calculate statistics
  const completedBookings = recurringBooking.advancedBookings.filter(
    ab => ab.booking?.status === 'COMPLETED'
  ).length;

  const totalCost = recurringBooking.advancedBookings.reduce(
    (sum, ab) => sum + (ab.booking?.total || 0), 0
  );

  const avgRating = recurringBooking.advancedBookings
    .filter(ab => ab.booking?.review?.rating)
    .reduce((sum, ab, _, arr) => sum + (ab.booking!.review!.rating / arr.length), 0);

  return NextResponse.json({
    recurringBooking: {
      ...recurringBooking,
      statistics: {
        totalBookings: recurringBooking.totalBookings,
        completedBookings,
        totalCost,
        averageRating: avgRating || null,
        nextBookingDate: recurringBooking.nextBooking,
        isActive: recurringBooking.isActive
      }
    }
  });
}

async function getUserRecurringBookings(user: any, status: string, page: number, limit: number) {
  const where: any = { userId: user.id };
  
  if (status === 'active') {
    where.isActive = true;
  } else if (status === 'inactive') {
    where.isActive = false;
  }

  const recurringBookings = await prisma.recurringBooking.findMany({
    where,
    include: {
      service: {
        select: {
          id: true,
          name: true,
          category: true,
          basePrice: true
        }
      },
      provider: {
        select: {
          id: true,
          name: true,
          verified: true,
          tier: true
        }
      },
      _count: {
        select: {
          advancedBookings: true,
          scheduleAdjustments: true
        }
      }
    },
    orderBy: [
      { isActive: 'desc' },
      { createdAt: 'desc' }
    ],
    skip: (page - 1) * limit,
    take: limit
  });

  const total = await prisma.recurringBooking.count({ where });

  return NextResponse.json({
    recurringBookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}

// Helper functions
function calculateNextBookingDate(data: any): Date {
  const startDate = new Date(data.startDate);
  const next = new Date(startDate);

  switch (data.frequency) {
    case 'WEEKLY':
      next.setDate(next.getDate() + (7 * data.interval));
      if (data.dayOfWeek !== undefined) {
        const daysDiff = (data.dayOfWeek - next.getDay() + 7) % 7;
        next.setDate(next.getDate() + daysDiff);
      }
      break;

    case 'BIWEEKLY':
      next.setDate(next.getDate() + (14 * data.interval));
      if (data.dayOfWeek !== undefined) {
        const daysDiff = (data.dayOfWeek - next.getDay() + 7) % 7;
        next.setDate(next.getDate() + daysDiff);
      }
      break;

    case 'MONTHLY':
      next.setMonth(next.getMonth() + data.interval);
      if (data.dayOfMonth) {
        next.setDate(Math.min(data.dayOfMonth, getLastDayOfMonth(next.getFullYear(), next.getMonth())));
      }
      break;

    case 'CUSTOM':
      // For custom frequency, interval represents days
      next.setDate(next.getDate() + data.interval);
      break;
  }

  // Set preferred time if specified
  if (data.preferredTime) {
    const [hours, minutes] = data.preferredTime.split(':').map(Number);
    next.setHours(hours, minutes, 0, 0);
  }

  return next;
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

async function generateFutureBookings(tx: any, recurringBooking: any, data: any, service: any, user: any) {
  // Generate up to 4 future bookings
  let currentDate = new Date(data.startDate);
  const maxBookings = Math.min(data.maxBookings || 4, 4);

  for (let i = 1; i < maxBookings; i++) {
    currentDate = calculateNextBookingDate({
      ...data,
      startDate: currentDate
    });

    // Don't create bookings beyond end date
    if (data.endDate && currentDate > new Date(data.endDate)) {
      break;
    }

    // Check for holidays and adjust if needed
    const isHoliday = await checkForHoliday(tx, currentDate);
    if (isHoliday && data.holidayHandling !== 'SKIP') {
      currentDate = adjustForHoliday(currentDate, data.holidayHandling);
    } else if (isHoliday && data.holidayHandling === 'SKIP') {
      continue; // Skip this booking
    }

    const futureBooking = await tx.booking.create({
      data: {
        userId: user.id,
        serviceId: data.serviceId,
        providerId: data.providerId,
        address: data.address,
        notes: `${data.notes || ''}\n\nAutomatically scheduled recurring booking`.trim(),
        total: service.basePrice,
        scheduledAt: currentDate,
        status: 'PENDING_CONFIRMATION'
      }
    });

    await tx.advancedBooking.create({
      data: {
        bookingId: futureBooking.id,
        type: 'RECURRING',
        organizerId: user.id,
        recurringId: recurringBooking.id,
        smartScheduled: false,
        weatherSensitive: data.weatherSensitive,
        totalCost: service.basePrice
      }
    });
  }
}

async function updateFutureBookings(tx: any, recurringBooking: any) {
  // Cancel existing future bookings
  const futureBookings = await tx.booking.findMany({
    where: {
      userId: recurringBooking.userId,
      scheduledAt: { gte: new Date() },
      status: { in: ['PENDING_CONFIRMATION', 'CONFIRMED'] },
      advancedBooking: {
        recurringId: recurringBooking.id
      }
    }
  });

  for (const booking of futureBookings) {
    await tx.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELED' }
    });
  }

  // Generate new future bookings with updated schedule
  // This would call generateFutureBookings with updated parameters
}

async function checkForHoliday(tx: any, date: Date): Promise<boolean> {
  const holiday = await tx.holidayCalendar.findFirst({
    where: {
      date: {
        gte: new Date(date.toDateString()),
        lt: new Date(new Date(date.toDateString()).getTime() + 24 * 60 * 60 * 1000)
      },
      affectsScheduling: true
    }
  });

  return !!holiday;
}

function adjustForHoliday(date: Date, handling: string): Date {
  const adjusted = new Date(date);
  
  if (handling === 'RESCHEDULE_BEFORE') {
    // Move to previous day (skip weekends)
    adjusted.setDate(adjusted.getDate() - 1);
    while (adjusted.getDay() === 0 || adjusted.getDay() === 6) {
      adjusted.setDate(adjusted.getDate() - 1);
    }
  } else if (handling === 'RESCHEDULE_AFTER') {
    // Move to next day (skip weekends)
    adjusted.setDate(adjusted.getDate() + 1);
    while (adjusted.getDay() === 0 || adjusted.getDay() === 6) {
      adjusted.setDate(adjusted.getDate() + 1);
    }
  }
  
  return adjusted;
}