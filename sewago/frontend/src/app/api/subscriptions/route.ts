import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  userId: z.string(),
  tier: z.enum(['FREE', 'PLUS', 'PRO']),
  paymentMethod: z.string().optional(),
});

const updateSubscriptionSchema = z.object({
  tier: z.enum(['FREE', 'PLUS', 'PRO']).optional(),
  autoRenew: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING']).optional(),
});

// GET /api/subscriptions - Get user's subscription
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        benefits: true,
        usage: {
          orderBy: { month: 'desc' },
          take: 12, // Last 12 months
        },
        familyPlan: {
          include: {
            owner: {
              select: { id: true, name: true, email: true }
            },
            invitations: {
              where: { status: 'PENDING' },
              select: { id: true, email: true, createdAt: true }
            }
          }
        }
      }
    });

    if (!subscription) {
      // Create default FREE subscription if none exists
      const newSubscription = await prisma.subscription.create({
        data: {
          userId,
          tier: 'FREE',
          status: 'ACTIVE',
        },
        include: {
          benefits: true,
          usage: true,
          familyPlan: true,
        }
      });

      return NextResponse.json(newSubscription);
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Create new subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createSubscriptionSchema.parse(body);

    // Check if user already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: validatedData.userId }
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'User already has a subscription' },
        { status: 400 }
      );
    }

    // Calculate subscription benefits based on tier
    const benefits = await generateSubscriptionBenefits(validatedData.tier);

    const subscription = await prisma.subscription.create({
      data: {
        ...validatedData,
        status: 'ACTIVE',
        nextBilling: getNextBillingDate(validatedData.tier),
        benefits: {
          create: benefits
        }
      },
      include: {
        benefits: true,
        usage: true,
      }
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

// PUT /api/subscriptions - Update subscription
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updateData } = body;
    const validatedData = updateSubscriptionSchema.parse(updateData);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // If tier is being updated, recalculate benefits
    if (validatedData.tier) {
      const benefits = await generateSubscriptionBenefits(validatedData.tier);
      
      // Update subscription and replace benefits
      await prisma.$transaction([
        prisma.subscriptionBenefit.deleteMany({
          where: { subscriptionId: userId }
        }),
        prisma.subscription.update({
          where: { userId },
          data: {
            ...validatedData,
            nextBilling: getNextBillingDate(validatedData.tier),
            benefits: {
              create: benefits
            }
          }
        })
      ]);
    } else {
      await prisma.subscription.update({
        where: { userId },
        data: validatedData
      });
    }

    const updatedSubscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        benefits: true,
        usage: true,
      }
    });

    return NextResponse.json(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

// Helper functions
async function generateSubscriptionBenefits(tier: 'FREE' | 'PLUS' | 'PRO') {
  const benefits = [];

  switch (tier) {
    case 'PLUS':
      benefits.push(
        {
          benefitType: 'DISCOUNT_PERCENTAGE',
          value: { percentage: 15 },
          isActive: true,
        },
        {
          benefitType: 'SERVICE_CREDITS',
          value: { amount: 10000 }, // NPR 100 in paisa
          isActive: true,
          usageLimit: 10000,
        },
        {
          benefitType: 'PRIORITY_SUPPORT',
          value: { level: 'enhanced' },
          isActive: true,
        }
      );
      break;
    case 'PRO':
      benefits.push(
        {
          benefitType: 'DISCOUNT_PERCENTAGE',
          value: { percentage: 25 },
          isActive: true,
        },
        {
          benefitType: 'SERVICE_CREDITS',
          value: { amount: 25000 }, // NPR 250 in paisa
          isActive: true,
          usageLimit: 25000,
        },
        {
          benefitType: 'PRIORITY_SUPPORT',
          value: { level: 'premium' },
          isActive: true,
        },
        {
          benefitType: 'EARLY_ACCESS',
          value: { enabled: true },
          isActive: true,
        },
        {
          benefitType: 'BOOKING_GUARANTEE',
          value: { enabled: true },
          isActive: true,
        },
        {
          benefitType: 'CONCIERGE_SERVICE',
          value: { enabled: true },
          isActive: true,
        }
      );
      break;
    default:
      // FREE tier has no additional benefits
      break;
  }

  return benefits;
}

function getNextBillingDate(tier: 'FREE' | 'PLUS' | 'PRO'): Date | null {
  if (tier === 'FREE') return null;
  
  const nextBilling = new Date();
  nextBilling.setMonth(nextBilling.getMonth() + 1);
  return nextBilling;
}