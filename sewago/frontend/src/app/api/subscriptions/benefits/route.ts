import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/subscriptions/benefits - Get available benefits for user
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

    // Get user's subscription and benefits
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        benefits: {
          where: { isActive: true },
          orderBy: { benefitType: 'asc' }
        },
        usage: {
          where: {
            month: new Date().toISOString().slice(0, 7) // Current month
          },
          take: 1
        }
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Calculate benefit utilization
    const benefitsWithUsage = subscription.benefits.map(benefit => {
      const usage = subscription.usage[0];
      let utilizationPercentage = 0;
      let remainingUsage = null;

      switch (benefit.benefitType) {
        case 'SERVICE_CREDITS':
          const creditsLimit = benefit.value.amount || 0;
          const creditsUsed = usage?.creditsUsed || 0;
          utilizationPercentage = creditsLimit > 0 ? (creditsUsed / creditsLimit) * 100 : 0;
          remainingUsage = Math.max(0, creditsLimit - creditsUsed);
          break;
        case 'DISCOUNT_PERCENTAGE':
          const discountUsed = usage?.discountUsed || 0;
          // For percentage discounts, we show total savings this month
          remainingUsage = discountUsed;
          break;
        case 'PRIORITY_SUPPORT':
          const supportTickets = usage?.supportTickets || 0;
          remainingUsage = supportTickets;
          break;
        default:
          // For boolean benefits like EARLY_ACCESS, BOOKING_GUARANTEE
          remainingUsage = benefit.value.enabled ? 1 : 0;
      }

      return {
        ...benefit,
        utilizationPercentage: Math.min(100, utilizationPercentage),
        remainingUsage,
        isNearLimit: utilizationPercentage > 80
      };
    });

    // Get tier comparison data
    const tierBenefits = getTierBenefits();

    return NextResponse.json({
      currentTier: subscription.tier,
      benefits: benefitsWithUsage,
      usage: subscription.usage[0] || {
        bookingsCount: 0,
        discountUsed: 0,
        creditsUsed: 0,
        supportTickets: 0
      },
      tierBenefits,
      upgradeRecommendations: generateUpgradeRecommendations(subscription.tier, benefitsWithUsage)
    });
  } catch (error) {
    console.error('Error fetching benefits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch benefits' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions/benefits - Use a benefit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, benefitType, usageAmount = 1 } = body;

    if (!userId || !benefitType) {
      return NextResponse.json(
        { error: 'User ID and benefit type are required' },
        { status: 400 }
      );
    }

    // Get subscription and benefit
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        benefits: {
          where: {
            benefitType,
            isActive: true
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

    const benefit = subscription.benefits[0];
    if (!benefit) {
      return NextResponse.json(
        { error: 'Benefit not available' },
        { status: 404 }
      );
    }

    // Check usage limits
    if (benefit.usageLimit && benefit.usageCount + usageAmount > benefit.usageLimit) {
      return NextResponse.json(
        { error: 'Benefit usage limit exceeded' },
        { status: 400 }
      );
    }

    // Update benefit usage
    const updatedBenefit = await prisma.subscriptionBenefit.update({
      where: { id: benefit.id },
      data: {
        usageCount: {
          increment: usageAmount
        }
      }
    });

    // Update monthly usage tracking
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usage = await prisma.subscriptionUsage.upsert({
      where: {
        subscriptionId_month: {
          subscriptionId: subscription.id,
          month: currentMonth
        }
      },
      create: {
        subscriptionId: subscription.id,
        month: currentMonth,
        ...getUsageUpdateFields(benefitType, usageAmount)
      },
      update: getUsageUpdateFields(benefitType, usageAmount)
    });

    return NextResponse.json({
      benefit: updatedBenefit,
      usage,
      message: getBenefitUsageMessage(benefitType, usageAmount)
    });
  } catch (error) {
    console.error('Error using benefit:', error);
    return NextResponse.json(
      { error: 'Failed to use benefit' },
      { status: 500 }
    );
  }
}

// Helper functions
function getTierBenefits() {
  return {
    FREE: {
      name: 'Free',
      price: 0,
      benefits: [
        'Standard booking experience',
        'Basic customer support',
        'Standard service prices',
        'Basic search functionality'
      ]
    },
    PLUS: {
      name: 'SewaGo Plus',
      price: 299,
      benefits: [
        '15% discount on all services',
        'Priority customer support',
        'Advanced booking scheduling',
        'Exclusive seasonal deals',
        'Monthly service credits (NPR 100)',
        'Enhanced notification preferences'
      ]
    },
    PRO: {
      name: 'SewaGo Pro',
      price: 599,
      benefits: [
        '25% discount on all services',
        'Premium 24/7 support',
        'Unlimited service bookings',
        'Advanced AI recommendations',
        'Service bundling with extra discounts',
        'Premium service guarantees & insurance',
        'Monthly service credits (NPR 250)',
        'Early access to new services',
        'Concierge booking assistance',
        'Provider preference guarantees'
      ]
    }
  };
}

function generateUpgradeRecommendations(currentTier: string, benefits: any[]) {
  if (currentTier === 'PRO') {
    return [];
  }

  const recommendations = [];

  // Check if user is using benefits heavily
  const highUsageBenefits = benefits.filter(b => b.utilizationPercentage > 70);
  
  if (highUsageBenefits.length > 0) {
    recommendations.push({
      type: 'HEAVY_USAGE',
      message: 'You\'re making great use of your benefits! Consider upgrading for even more value.',
      suggestedTier: currentTier === 'FREE' ? 'PLUS' : 'PRO'
    });
  }

  // Check credits usage
  const creditsUsage = benefits.find(b => b.benefitType === 'SERVICE_CREDITS');
  if (creditsUsage && creditsUsage.utilizationPercentage > 80) {
    recommendations.push({
      type: 'CREDITS_EXHAUSTED',
      message: 'You\'ve used most of your service credits. Upgrade for more credits and higher discounts!',
      suggestedTier: 'PRO'
    });
  }

  // General upgrade suggestion for FREE users
  if (currentTier === 'FREE') {
    recommendations.push({
      type: 'FREE_USER',
      message: 'Unlock premium benefits with SewaGo Plus - start saving on every service!',
      suggestedTier: 'PLUS'
    });
  }

  return recommendations;
}

function getUsageUpdateFields(benefitType: string, usageAmount: number) {
  switch (benefitType) {
    case 'SERVICE_CREDITS':
      return { creditsUsed: { increment: usageAmount } };
    case 'DISCOUNT_PERCENTAGE':
      return { discountUsed: { increment: usageAmount } };
    case 'PRIORITY_SUPPORT':
      return { supportTickets: { increment: 1 } };
    default:
      return {};
  }
}

function getBenefitUsageMessage(benefitType: string, usageAmount: number) {
  switch (benefitType) {
    case 'SERVICE_CREDITS':
      return `Service credits applied: NPR ${usageAmount / 100}`;
    case 'DISCOUNT_PERCENTAGE':
      return `Discount applied: NPR ${usageAmount / 100}`;
    case 'PRIORITY_SUPPORT':
      return 'Priority support request submitted';
    case 'EARLY_ACCESS':
      return 'Early access feature enabled';
    case 'BOOKING_GUARANTEE':
      return 'Booking guarantee activated';
    case 'CONCIERGE_SERVICE':
      return 'Concierge service requested';
    default:
      return 'Benefit used successfully';
  }
}