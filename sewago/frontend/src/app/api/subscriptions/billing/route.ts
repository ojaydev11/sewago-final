import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateBillingSchema = z.object({
  userId: z.string(),
  paymentMethod: z.string(),
  autoRenew: z.boolean().optional(),
});

// GET /api/subscriptions/billing - Get billing information
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

    // Get subscription with billing info
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        familyPlan: {
          select: {
            id: true,
            tier: true,
            maxMembers: true,
            currentMembers: true
          }
        }
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Calculate billing information
    const billingInfo = calculateBillingInfo(subscription);

    // Get billing history (mock data for now)
    const billingHistory = await getBillingHistory(subscription.id);

    // Get upcoming billing
    const upcomingBilling = getUpcomingBilling(subscription);

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        startDate: subscription.startDate,
        nextBilling: subscription.nextBilling,
        lastPayment: subscription.lastPayment,
        autoRenew: subscription.autoRenew,
        paymentMethod: subscription.paymentMethod
      },
      billing: billingInfo,
      upcomingBilling,
      history: billingHistory,
      familyPlan: subscription.familyPlan,
      paymentMethods: getAvailablePaymentMethods()
    });
  } catch (error) {
    console.error('Error fetching billing information:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing information' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions/billing - Update billing information
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'update_payment_method') {
      return await updatePaymentMethod(body);
    } else if (action === 'toggle_auto_renew') {
      return await toggleAutoRenew(body);
    } else if (action === 'cancel_subscription') {
      return await cancelSubscription(body);
    } else if (action === 'reactivate_subscription') {
      return await reactivateSubscription(body);
    } else if (action === 'process_payment') {
      return await processSubscriptionPayment(body);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating billing:', error);
    return NextResponse.json(
      { error: 'Failed to update billing information' },
      { status: 500 }
    );
  }
}

async function updatePaymentMethod(body: any) {
  const validatedData = updateBillingSchema.parse(body);
  const { userId, paymentMethod } = validatedData;

  const updatedSubscription = await prisma.subscription.update({
    where: { userId },
    data: { paymentMethod }
  });

  // Send confirmation notification
  await prisma.notification.create({
    data: {
      userId,
      message: `Payment method updated to ${paymentMethod} successfully.`,
      type: 'BILLING_UPDATE',
      channel: 'APP'
    }
  });

  return NextResponse.json({
    subscription: updatedSubscription,
    message: 'Payment method updated successfully'
  });
}

async function toggleAutoRenew(body: any) {
  const { userId, autoRenew } = body;

  if (!userId || typeof autoRenew !== 'boolean') {
    return NextResponse.json(
      { error: 'User ID and autoRenew flag are required' },
      { status: 400 }
    );
  }

  const updatedSubscription = await prisma.subscription.update({
    where: { userId },
    data: { autoRenew }
  });

  // Send confirmation notification
  await prisma.notification.create({
    data: {
      userId,
      message: `Auto-renewal ${autoRenew ? 'enabled' : 'disabled'} for your subscription.`,
      type: 'BILLING_UPDATE',
      channel: 'APP'
    }
  });

  return NextResponse.json({
    subscription: updatedSubscription,
    message: `Auto-renewal ${autoRenew ? 'enabled' : 'disabled'} successfully`
  });
}

async function cancelSubscription(body: any) {
  const { userId, reason, cancelImmediately = false } = body;

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { familyPlan: true }
  });

  if (!subscription) {
    return NextResponse.json(
      { error: 'No subscription found' },
      { status: 404 }
    );
  }

  // If user owns a family plan, handle member transitions
  if (subscription.familyPlan && subscription.familyPlan.ownerId === userId) {
    return NextResponse.json(
      { error: 'Cannot cancel subscription while owning a family plan. Please transfer ownership or cancel family plan first.' },
      { status: 400 }
    );
  }

  const updateData = cancelImmediately ? {
    status: 'CANCELLED',
    tier: 'FREE',
    autoRenew: false,
    endDate: new Date(),
    familyPlanId: null
  } : {
    status: 'CANCELLED',
    autoRenew: false,
    endDate: subscription.nextBilling || new Date()
  };

  const updatedSubscription = await prisma.$transaction(async (tx) => {
    // Update subscription
    const updated = await tx.subscription.update({
      where: { userId },
      data: updateData
    });

    // If part of family plan, remove from it
    if (subscription.familyPlanId) {
      await tx.familyPlan.update({
        where: { id: subscription.familyPlanId },
        data: {
          currentMembers: { decrement: 1 }
        }
      });
    }

    // Deactivate benefits if cancelled immediately
    if (cancelImmediately) {
      await tx.subscriptionBenefit.updateMany({
        where: { subscriptionId: subscription.id },
        data: { isActive: false }
      });
    }

    return updated;
  });

  // Send cancellation confirmation
  await prisma.notification.create({
    data: {
      userId,
      message: cancelImmediately 
        ? 'Your subscription has been cancelled immediately.' 
        : `Your subscription will end on ${subscription.nextBilling?.toDateString()}. You'll continue to have access until then.`,
      type: 'SUBSCRIPTION_CANCELLED',
      channel: 'APP'
    }
  });

  return NextResponse.json({
    subscription: updatedSubscription,
    message: 'Subscription cancelled successfully'
  });
}

async function reactivateSubscription(body: any) {
  const { userId, tier, paymentMethod } = body;

  if (!userId || !tier || !paymentMethod) {
    return NextResponse.json(
      { error: 'User ID, tier, and payment method are required' },
      { status: 400 }
    );
  }

  // Process payment first
  const pricing = getSubscriptionPricing(tier);
  const paymentResult = await processPayment({
    amount: pricing.monthly,
    paymentMethod,
    userId,
    description: `Reactivation of SewaGo ${tier} subscription`
  });

  if (!paymentResult.success) {
    return NextResponse.json(
      { error: 'Payment failed', details: paymentResult.error },
      { status: 400 }
    );
  }

  // Reactivate subscription
  const newBenefits = await generateSubscriptionBenefits(tier);
  
  const updatedSubscription = await prisma.$transaction(async (tx) => {
    // Update subscription
    const updated = await tx.subscription.update({
      where: { userId },
      data: {
        tier,
        status: 'ACTIVE',
        autoRenew: true,
        paymentMethod,
        lastPayment: new Date(),
        nextBilling: getNextBillingDate(),
        endDate: null
      }
    });

    // Reactivate or create benefits
    await tx.subscriptionBenefit.deleteMany({
      where: { subscriptionId: updated.id }
    });

    await tx.subscriptionBenefit.createMany({
      data: newBenefits.map(benefit => ({
        subscriptionId: updated.id,
        ...benefit
      }))
    });

    return updated;
  });

  // Send reactivation confirmation
  await prisma.notification.create({
    data: {
      userId,
      message: `Welcome back! Your SewaGo ${tier} subscription has been reactivated.`,
      type: 'SUBSCRIPTION_REACTIVATED',
      channel: 'APP'
    }
  });

  return NextResponse.json({
    subscription: updatedSubscription,
    payment: {
      amount: pricing.monthly,
      transactionId: paymentResult.transactionId
    },
    message: 'Subscription reactivated successfully'
  });
}

async function processSubscriptionPayment(body: any) {
  const { userId, amount, paymentMethod, paymentToken } = body;

  const paymentResult = await processPayment({
    amount,
    paymentMethod,
    paymentToken,
    userId,
    description: 'Subscription payment'
  });

  if (!paymentResult.success) {
    return NextResponse.json(
      { error: 'Payment failed', details: paymentResult.error },
      { status: 400 }
    );
  }

  // Update subscription payment info
  await prisma.subscription.update({
    where: { userId },
    data: {
      lastPayment: new Date(),
      nextBilling: getNextBillingDate()
    }
  });

  return NextResponse.json({
    payment: paymentResult,
    message: 'Payment processed successfully'
  });
}

// Helper functions
function calculateBillingInfo(subscription: any) {
  const pricing = getSubscriptionPricing(subscription.tier);
  
  let currentCost = 0;
  const billingCycle = 'monthly';

  if (subscription.familyPlan && subscription.familyPlan.ownerId === subscription.userId) {
    // Family plan pricing
    const familyPricing = getFamilyPlanPricing(subscription.tier);
    currentCost = familyPricing;
  } else if (subscription.tier !== 'FREE') {
    currentCost = pricing.monthly;
  }

  return {
    currentCost,
    billingCycle,
    currency: 'NPR',
    nextBillingAmount: currentCost,
    nextBillingDate: subscription.nextBilling,
    daysUntilBilling: subscription.nextBilling 
      ? Math.ceil((new Date(subscription.nextBilling).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null
  };
}

function getSubscriptionPricing(tier: string) {
  const pricing = {
    FREE: { monthly: 0, yearly: 0 },
    PLUS: { monthly: 29900, yearly: 299000 }, // NPR 299, NPR 2990 in paisa
    PRO: { monthly: 59900, yearly: 599000 }   // NPR 599, NPR 5990 in paisa
  };
  
  return pricing[tier] || pricing.FREE;
}

function getFamilyPlanPricing(tier: string) {
  const pricing = {
    PLUS: 49900,  // NPR 499 in paisa
    PRO: 89900    // NPR 899 in paisa
  };
  
  return pricing[tier] || 0;
}

async function getBillingHistory(subscriptionId: string) {
  // Mock billing history - in production, this would come from payment processor records
  return [
    {
      id: '1',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      amount: 29900,
      currency: 'NPR',
      status: 'PAID',
      paymentMethod: 'khalti',
      description: 'SewaGo Plus Monthly Subscription'
    },
    {
      id: '2',
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      amount: 29900,
      currency: 'NPR',
      status: 'PAID',
      paymentMethod: 'khalti',
      description: 'SewaGo Plus Monthly Subscription'
    }
  ];
}

function getUpcomingBilling(subscription: any) {
  if (subscription.tier === 'FREE' || subscription.status === 'CANCELLED') {
    return null;
  }

  const pricing = subscription.familyPlan && subscription.familyPlan.ownerId === subscription.userId
    ? getFamilyPlanPricing(subscription.tier)
    : getSubscriptionPricing(subscription.tier).monthly;

  return {
    date: subscription.nextBilling,
    amount: pricing,
    currency: 'NPR',
    paymentMethod: subscription.paymentMethod,
    autoRenew: subscription.autoRenew
  };
}

function getAvailablePaymentMethods() {
  return [
    {
      id: 'khalti',
      name: 'Khalti',
      type: 'digital_wallet',
      supported: true,
      icon: '/payment-icons/khalti.png'
    },
    {
      id: 'esewa',
      name: 'eSewa',
      type: 'digital_wallet',
      supported: true,
      icon: '/payment-icons/esewa.png'
    }
  ];
}

async function processPayment({ amount, paymentMethod, paymentToken, userId, description }) {
  try {
    // Mock payment processing - integrate with actual payment gateways
    if (paymentMethod === 'khalti') {
      return {
        success: true,
        transactionId: `khalti_${Date.now()}_${userId}`,
        amount,
        currency: 'NPR',
        method: 'khalti'
      };
    } else if (paymentMethod === 'esewa') {
      return {
        success: true,
        transactionId: `esewa_${Date.now()}_${userId}`,
        amount,
        currency: 'NPR',
        method: 'esewa'
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

async function generateSubscriptionBenefits(tier: string) {
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

function getNextBillingDate(): Date {
  const nextBilling = new Date();
  nextBilling.setMonth(nextBilling.getMonth() + 1);
  return nextBilling;
}