import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Schema for creating advanced booking
const createAdvancedBookingSchema = z.object({
  type: z.enum(['STANDARD', 'GROUP', 'RECURRING', 'SMART_SCHEDULED']),
  serviceId: z.string(),
  providerId: z.string().optional(),
  address: z.string(),
  notes: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  preferredTimes: z.array(z.object({
    start: z.string(),
    end: z.string(),
    priority: z.number().min(1).max(5)
  })).optional(),
  weatherSensitive: z.boolean().default(false),
  trafficOptimized: z.boolean().default(true),
  smartScheduled: z.boolean().default(false),
  groupSettings: z.object({
    title: z.string(),
    description: z.string().optional(),
    maxParticipants: z.number().min(2).max(20).default(10),
    splitMethod: z.enum(['EQUAL', 'PERCENTAGE', 'CUSTOM', 'BY_SERVICE']).default('EQUAL'),
    groupDiscount: z.number().min(0).max(50).default(0)
  }).optional(),
  recurringSettings: z.object({
    frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM']),
    interval: z.number().min(1).max(12).default(1),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
    preferredTime: z.string().optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional()
  }).optional()
});

// Schema for updating advanced booking
const updateAdvancedBookingSchema = z.object({
  id: z.string(),
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  smartScheduled: z.boolean().optional(),
  weatherSensitive: z.boolean().optional(),
  trafficOptimized: z.boolean().optional()
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
    const data = createAdvancedBookingSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find service
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create base booking first
      const booking = await tx.booking.create({
        data: {
          userId: user.id,
          serviceId: data.serviceId,
          providerId: data.providerId,
          address: data.address,
          notes: data.notes,
          total: service.basePrice,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
          status: 'PENDING_CONFIRMATION'
        }
      });

      // Create advanced booking
      const advancedBooking = await tx.advancedBooking.create({
        data: {
          bookingId: booking.id,
          type: data.type,
          organizerId: user.id,
          smartScheduled: data.smartScheduled,
          preferredTimes: data.preferredTimes || [],
          weatherSensitive: data.weatherSensitive,
          trafficOptimized: data.trafficOptimized,
          totalCost: service.basePrice
        }
      });

      // Handle group booking
      if (data.type === 'GROUP' && data.groupSettings) {
        const groupBooking = await tx.groupBooking.create({
          data: {
            title: data.groupSettings.title,
            description: data.groupSettings.description,
            maxParticipants: data.groupSettings.maxParticipants,
            splitMethod: data.groupSettings.splitMethod,
            groupDiscount: data.groupSettings.groupDiscount,
            inviteCode: generateInviteCode(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          }
        });

        // Update advanced booking with group ID
        await tx.advancedBooking.update({
          where: { id: advancedBooking.id },
          data: { 
            groupId: groupBooking.id,
            splitMethod: data.groupSettings.splitMethod
          }
        });

        // Add organizer as first participant
        await tx.bookingParticipant.create({
          data: {
            userId: user.id,
            advancedBookingId: advancedBooking.id,
            groupBookingId: groupBooking.id,
            role: 'ORGANIZER',
            status: 'CONFIRMED',
            shareAmount: Math.floor(service.basePrice * (1 - data.groupSettings.groupDiscount / 100)),
            paymentStatus: 'PENDING'
          }
        });
      }

      // Handle recurring booking
      if (data.type === 'RECURRING' && data.recurringSettings) {
        const recurringBooking = await tx.recurringBooking.create({
          data: {
            userId: user.id,
            serviceId: data.serviceId,
            providerId: data.providerId,
            frequency: data.recurringSettings.frequency,
            interval: data.recurringSettings.interval,
            dayOfWeek: data.recurringSettings.dayOfWeek,
            dayOfMonth: data.recurringSettings.dayOfMonth,
            preferredTime: data.recurringSettings.preferredTime,
            startDate: new Date(data.recurringSettings.startDate),
            endDate: data.recurringSettings.endDate ? new Date(data.recurringSettings.endDate) : null,
            nextBooking: calculateNextBookingDate(
              new Date(data.recurringSettings.startDate),
              data.recurringSettings.frequency,
              data.recurringSettings.interval,
              data.recurringSettings.dayOfWeek,
              data.recurringSettings.dayOfMonth
            )
          }
        });

        // Update advanced booking with recurring ID
        await tx.advancedBooking.update({
          where: { id: advancedBooking.id },
          data: { recurringId: recurringBooking.id }
        });
      }

      return {
        booking,
        advancedBooking,
        message: 'Advanced booking created successfully'
      };
    });

    // Generate smart schedule if requested
    if (data.smartScheduled) {
      await generateSmartSchedule(result.advancedBooking.id, {
        serviceId: data.serviceId,
        providerId: data.providerId,
        preferredTimes: data.preferredTimes || [],
        weatherSensitive: data.weatherSensitive,
        trafficOptimized: data.trafficOptimized,
        address: data.address
      });
    }

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Error creating advanced booking:', error);
    
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
    const type = searchParams.get('type');
    const status = searchParams.get('status');
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

    const where: any = {
      OR: [
        { organizerId: user.id },
        { participants: { some: { userId: user.id } } }
      ]
    };

    if (type) {
      where.type = type;
    }

    const advancedBookings = await prisma.advancedBooking.findMany({
      where,
      include: {
        booking: {
          include: {
            service: true,
            provider: true
          }
        },
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        group: {
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
            }
          }
        },
        recurring: true,
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
        scheduleOptions: {
          where: { isSelected: true },
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                verified: true,
                tier: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.advancedBooking.count({ where });

    return NextResponse.json({
      bookings: advancedBookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching advanced bookings:', error);
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
    const data = updateAdvancedBookingSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to update this booking
    const advancedBooking = await prisma.advancedBooking.findFirst({
      where: {
        id: data.id,
        OR: [
          { organizerId: user.id },
          { participants: { some: { userId: user.id, role: 'ORGANIZER' } } }
        ]
      },
      include: { booking: true }
    });

    if (!advancedBooking) {
      return NextResponse.json(
        { error: 'Booking not found or access denied' },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update advanced booking
      const updatedAdvanced = await tx.advancedBooking.update({
        where: { id: data.id },
        data: {
          smartScheduled: data.smartScheduled,
          weatherSensitive: data.weatherSensitive,
          trafficOptimized: data.trafficOptimized,
          updatedAt: new Date()
        }
      });

      // Update base booking if needed
      if (data.scheduledAt || data.notes) {
        await tx.booking.update({
          where: { id: advancedBooking.bookingId! },
          data: {
            scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
            notes: data.notes,
            status: data.status as any
          }
        });
      }

      return updatedAdvanced;
    });

    return NextResponse.json({
      booking: result,
      message: 'Advanced booking updated successfully'
    });

  } catch (error) {
    console.error('Error updating advanced booking:', error);
    
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

// Helper functions
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function calculateNextBookingDate(
  startDate: Date,
  frequency: string,
  interval: number,
  dayOfWeek?: number,
  dayOfMonth?: number
): Date {
  const nextDate = new Date(startDate);
  
  switch (frequency) {
    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + (7 * interval));
      break;
    case 'BIWEEKLY':
      nextDate.setDate(nextDate.getDate() + (14 * interval));
      break;
    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + interval);
      if (dayOfMonth) {
        nextDate.setDate(dayOfMonth);
      }
      break;
    default:
      nextDate.setDate(nextDate.getDate() + interval);
  }
  
  return nextDate;
}

async function generateSmartSchedule(
  advancedBookingId: string,
  options: {
    serviceId: string;
    providerId?: string;
    preferredTimes: Array<{ start: string; end: string; priority: number }>;
    weatherSensitive: boolean;
    trafficOptimized: boolean;
    address: string;
  }
) {
  try {
    // Find available providers
    const providers = await prisma.provider.findMany({
      where: {
        verified: true,
        isOnline: true,
        ...(options.providerId ? { id: options.providerId } : {})
      },
      orderBy: [
        { tier: 'desc' },
        { completionPct: 'desc' },
        { onTimePct: 'desc' }
      ],
      take: 5
    });

    // Generate schedule options for each provider
    for (const provider of providers) {
      const scheduleOptions = await generateProviderScheduleOptions(
        provider.id,
        options
      );

      // Save schedule options
      for (const option of scheduleOptions) {
        await prisma.scheduleOption.create({
          data: {
            advancedBookingId,
            providerId: provider.id,
            suggestedTime: option.suggestedTime,
            probability: option.probability,
            reasoning: option.reasoning,
            weatherFactor: option.weatherFactor,
            trafficFactor: option.trafficFactor,
            providerScore: option.providerScore,
            userPreferenceScore: option.userPreferenceScore
          }
        });
      }
    }

  } catch (error) {
    console.error('Error generating smart schedule:', error);
  }
}

async function generateProviderScheduleOptions(
  providerId: string,
  options: {
    preferredTimes: Array<{ start: string; end: string; priority: number }>;
    weatherSensitive: boolean;
    trafficOptimized: boolean;
    address: string;
  }
) {
  // This is a simplified AI scheduling logic
  // In production, this would integrate with ML models, weather APIs, and traffic data
  
  const scheduleOptions = [];
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Generate time slots for the next 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
    
    // Skip past hours for today
    const startHour = day === 0 ? Math.max(9, now.getHours() + 1) : 9;
    
    for (let hour = startHour; hour <= 17; hour++) {
      const suggestedTime = new Date(date);
      suggestedTime.setHours(hour, 0, 0, 0);
      
      // Calculate probability based on various factors
      let probability = 0.5; // Base probability
      
      // Provider availability factor (mock)
      const providerScore = Math.random() * 0.4 + 0.6; // 0.6-1.0
      probability *= providerScore;
      
      // User preference factor
      let userPreferenceScore = 0.5;
      for (const pref of options.preferredTimes) {
        const prefStart = parseInt(pref.start.split(':')[0]);
        const prefEnd = parseInt(pref.end.split(':')[0]);
        if (hour >= prefStart && hour <= prefEnd) {
          userPreferenceScore = Math.min(1.0, userPreferenceScore + (pref.priority / 5) * 0.3);
        }
      }
      probability *= userPreferenceScore;
      
      // Weather factor (mock - in production, use real weather API)
      let weatherFactor = 1.0;
      if (options.weatherSensitive) {
        weatherFactor = Math.random() * 0.5 + 0.5; // 0.5-1.0
        probability *= weatherFactor;
      }
      
      // Traffic factor (mock - in production, use real traffic API)
      let trafficFactor = 1.0;
      if (options.trafficOptimized) {
        // Better scores for off-peak hours
        if (hour < 8 || hour > 18 || (hour >= 11 && hour <= 14)) {
          trafficFactor = 0.9;
        } else {
          trafficFactor = 0.6;
        }
        probability *= trafficFactor;
      }
      
      // Only include options with reasonable probability
      if (probability > 0.3) {
        scheduleOptions.push({
          suggestedTime,
          probability: Math.min(1.0, probability),
          reasoning: {
            factors: ['provider_availability', 'user_preference', 'weather', 'traffic'],
            explanation: `Optimal time based on provider availability (${(providerScore * 100).toFixed(0)}%), user preferences (${(userPreferenceScore * 100).toFixed(0)}%), and external factors.`
          },
          weatherFactor: options.weatherSensitive ? weatherFactor : null,
          trafficFactor: options.trafficOptimized ? trafficFactor : null,
          providerScore,
          userPreferenceScore
        });
      }
    }
  }
  
  // Sort by probability and return top options
  return scheduleOptions
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 10);
}