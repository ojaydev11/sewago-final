import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const upgradeSchema = z.object({
  userId: z.string(),
  newTier: z.enum(['PLUS', 'PRO']),
  paymentMethod: z.string(),
  paymentToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = upgradeSchema.parse(body);

    const { userId, newTier, paymentMethod, paymentToken } = validatedData;

    // Get current subscription
    const currentSubscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { benefits: true }
    });

    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No subscription found for user' },
        { status: 404 }
      );
    }

    // Calculate pricing
    const pricing = getSubscriptionPricing(newTier);
    const prorationAmount = calculateProration(currentSubscription, newTier);

    // Process payment
    const paymentResult = await processSubscriptionPayment({
      amount: pricing.monthly - prorationAmount,
      paymentMethod,
      paymentToken,
      userId,
      subscriptionTier: newTier
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: 'Payment failed', details: paymentResult.error },
        { status: 400 }
      );
    }

    // Generate new benefits for the upgraded tier
    const newBenefits = await generateSubscriptionBenefits(newTier);

    // Update subscription with transaction
    const updatedSubscription = await prisma.$transaction(async (tx) => {
      // Remove old benefits
      await tx.subscriptionBenefit.deleteMany({
        where: { subscriptionId: currentSubscription.id }
      });

      // Update subscription
      const updated = await tx.subscription.update({
        where: { userId },
        data: {
          tier: newTier,
          status: 'ACTIVE',
          lastPayment: new Date(),
          nextBilling: getNextBillingDate(newTier),
          paymentMethod,
          benefits: {
            create: newBenefits
          }
        },
        include: {
          benefits: true,
          usage: true
        }
      });

      // Record usage for this month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      await tx.subscriptionUsage.upsert({
        where: {
          subscriptionId_month: {
            subscriptionId: updated.id,
            month: currentMonth
          }
        },
        create: {
          subscriptionId: updated.id,
          month: currentMonth
        },
        update: {}
      });

      return updated;
    });

    // Send upgrade confirmation notification
    await sendUpgradeNotification(userId, newTier, pricing.monthly);

    return NextResponse.json({
      subscription: updatedSubscription,
      payment: {
        amount: pricing.monthly - prorationAmount,
        currency: 'NPR',
        method: paymentMethod,
        transactionId: paymentResult.transactionId
      }
    });

  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    );
  }
}

// Helper functions
function getSubscriptionPricing(tier: 'PLUS' | 'PRO') {
  const pricing = {
    PLUS: { monthly: 29900, yearly: 299000 }, // NPR 299, NPR 2990 in paisa
    PRO: { monthly: 59900, yearly: 599000 }   // NPR 599, NPR 5990 in paisa
  };
  
  return pricing[tier];
}

function calculateProration(currentSubscription: any, newTier: 'PLUS' | 'PRO'): number {
  // If upgrading from FREE, no prorated credit
  if (currentSubscription.tier === 'FREE') {
    return 0;
  }

  // Calculate remaining days in current billing cycle
  const now = new Date();
  const nextBilling = new Date(currentSubscription.nextBilling);
  const daysRemaining = Math.max(0, Math.ceil((nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const totalDaysInMonth = 30;

  // Calculate prorated credit from current tier
  const currentPricing = getSubscriptionPricing(currentSubscription.tier as 'PLUS' | 'PRO');
  const dailyRate = currentPricing.monthly / totalDaysInMonth;
  const proratedCredit = Math.floor(dailyRate * daysRemaining);

  return proratedCredit;
}

async function processSubscriptionPayment({
  amount,
  paymentMethod,
  paymentToken,
  userId,
  subscriptionTier
}: {
  amount: number;
  paymentMethod: string;
  paymentToken?: string;
  userId: string;
  subscriptionTier: string;
}) {
  try {
    // This would integrate with actual payment processors
    // For now, return a mock successful payment
    if (paymentMethod === 'khalti') {
      return {
        success: true,
        transactionId: `sub_${Date.now()}_${userId}`,
        amount,
        currency: 'NPR'
      };
    } else if (paymentMethod === 'esewa') {
      return {
        success: true,
        transactionId: `esewa_sub_${Date.now()}_${userId}`,
        amount,
        currency: 'NPR'
      };
    }

    return {
      success: false,
      error: 'Unsupported payment method'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Payment processing failed'
    };
  }
}

async function generateSubscriptionBenefits(tier: 'PLUS' | 'PRO') {
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
  }

  return benefits;
}

function getNextBillingDate(tier: 'PLUS' | 'PRO'): Date {
  const nextBilling = new Date();
  nextBilling.setMonth(nextBilling.getMonth() + 1);
  return nextBilling;
}

async function sendUpgradeNotification(userId: string, tier: string, amount: number) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        message: `Congratulations! You've successfully upgraded to SewaGo ${tier}. Your subscription is now active with premium benefits.`,
        type: 'SUBSCRIPTION_UPGRADE',
        channel: 'APP'
      }
    });
  } catch (error) {
    console.error('Error sending upgrade notification:', error);
  }
}