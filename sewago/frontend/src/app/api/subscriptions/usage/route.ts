import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/subscriptions/usage - Get usage analytics for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const months = parseInt(searchParams.get('months') || '12');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        usage: {
          orderBy: { month: 'desc' },
          take: months
        },
        benefits: {
          where: { isActive: true }
        }
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Calculate current month usage
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentUsage = subscription.usage.find(u => u.month === currentMonth) || {
      bookingsCount: 0,
      discountUsed: 0,
      creditsUsed: 0,
      supportTickets: 0
    };

    // Calculate total savings and usage over time
    const totalSavings = subscription.usage.reduce((sum, usage) => 
      sum + usage.discountUsed + usage.creditsUsed, 0);

    const totalBookings = subscription.usage.reduce((sum, usage) => 
      sum + usage.bookingsCount, 0);

    const averageMonthlyBookings = subscription.usage.length > 0 
      ? totalBookings / subscription.usage.length 
      : 0;

    // Generate monthly trend data
    const monthlyTrends = generateMonthlyTrends(subscription.usage);

    // Calculate benefit utilization
    const benefitUtilization = calculateBenefitUtilization(subscription.benefits, currentUsage);

    // Get tier-specific analytics
    const tierAnalytics = getTierAnalytics(subscription.tier, subscription.usage);

    // Generate insights and recommendations
    const insights = generateUsageInsights(subscription, currentUsage, totalSavings);

    return NextResponse.json({
      subscription: {
        tier: subscription.tier,
        status: subscription.status,
        startDate: subscription.startDate,
        nextBilling: subscription.nextBilling
      },
      currentMonth: {
        month: currentMonth,
        ...currentUsage
      },
      totals: {
        totalSavings,
        totalBookings,
        averageMonthlyBookings,
        totalSupportTickets: subscription.usage.reduce((sum, u) => sum + u.supportTickets, 0)
      },
      trends: monthlyTrends,
      benefitUtilization,
      tierAnalytics,
      insights,
      usage: subscription.usage
    });
  } catch (error) {
    console.error('Error fetching usage analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage analytics' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions/usage - Record usage event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, eventType, amount, bookingId } = body;

    if (!userId || !eventType) {
      return NextResponse.json(
        { error: 'User ID and event type are required' },
        { status: 400 }
      );
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    // Update usage based on event type
    const updateData = getUsageUpdateData(eventType, amount || 1);

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
        ...updateData
      },
      update: updateData
    });

    // Log the event for analytics
    await logUsageEvent(subscription.id, eventType, amount, bookingId);

    return NextResponse.json({
      usage,
      message: `${eventType} recorded successfully`
    });
  } catch (error) {
    console.error('Error recording usage:', error);
    return NextResponse.json(
      { error: 'Failed to record usage' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateMonthlyTrends(usageData: any[]) {
  const trends = usageData.map(usage => ({
    month: usage.month,
    bookings: usage.bookingsCount,
    savings: usage.discountUsed + usage.creditsUsed,
    discountUsed: usage.discountUsed,
    creditsUsed: usage.creditsUsed,
    supportTickets: usage.supportTickets
  })).reverse(); // Show chronological order

  // Calculate month-over-month growth
  const trendsWithGrowth = trends.map((current, index) => {
    if (index === 0) return { ...current, growth: 0 };
    
    const previous = trends[index - 1];
    const bookingGrowth = previous.bookings > 0 
      ? ((current.bookings - previous.bookings) / previous.bookings * 100)
      : 0;
    
    const savingsGrowth = previous.savings > 0
      ? ((current.savings - previous.savings) / previous.savings * 100)
      : 0;

    return {
      ...current,
      bookingGrowth: Math.round(bookingGrowth),
      savingsGrowth: Math.round(savingsGrowth)
    };
  });

  return trendsWithGrowth;
}

function calculateBenefitUtilization(benefits: any[], currentUsage: any) {
  return benefits.map(benefit => {
    let utilization = 0;
    let maxUsage = 0;

    switch (benefit.benefitType) {
      case 'SERVICE_CREDITS':
        maxUsage = benefit.value.amount || 0;
        utilization = maxUsage > 0 ? (currentUsage.creditsUsed / maxUsage) * 100 : 0;
        break;
      case 'DISCOUNT_PERCENTAGE':
        // For discounts, show total usage this month
        utilization = currentUsage.discountUsed;
        maxUsage = currentUsage.discountUsed;
        break;
      case 'PRIORITY_SUPPORT':
        utilization = currentUsage.supportTickets;
        maxUsage = 10; // Assume reasonable limit
        break;
      default:
        utilization = benefit.usageCount;
        maxUsage = benefit.usageLimit || 1;
    }

    return {
      benefitType: benefit.benefitType,
      utilization: Math.min(100, utilization),
      used: benefit.usageCount,
      limit: maxUsage,
      isNearLimit: utilization > 80
    };
  });
}

function getTierAnalytics(tier: string, usageData: any[]) {
  const analytics = {
    tier,
    tierBenefits: getTierBenefitsCount(tier),
    averageMonthlyUsage: {},
    tierOptimization: {}
  };

  if (usageData.length > 0) {
    const totalUsage = usageData.reduce((acc, usage) => ({
      bookings: acc.bookings + usage.bookingsCount,
      discounts: acc.discounts + usage.discountUsed,
      credits: acc.credits + usage.creditsUsed,
      support: acc.support + usage.supportTickets
    }), { bookings: 0, discounts: 0, credits: 0, support: 0 });

    analytics.averageMonthlyUsage = {
      bookings: Math.round(totalUsage.bookings / usageData.length),
      savings: Math.round((totalUsage.discounts + totalUsage.credits) / usageData.length),
      supportTickets: Math.round(totalUsage.support / usageData.length)
    };

    analytics.tierOptimization = calculateTierOptimization(tier, analytics.averageMonthlyUsage);
  }

  return analytics;
}

function getTierBenefitsCount(tier: string) {
  const benefits = {
    FREE: 4,
    PLUS: 6,
    PRO: 10
  };
  return benefits[tier] || 0;
}

function calculateTierOptimization(tier: string, avgUsage: any) {
  const suggestions = [];

  if (tier === 'FREE' && avgUsage.bookings > 2) {
    suggestions.push({
      type: 'UPGRADE_RECOMMENDED',
      message: 'With your booking frequency, upgrading to Plus would save you money',
      potentialSavings: avgUsage.bookings * 50 // Estimated savings
    });
  }

  if (tier === 'PLUS' && avgUsage.savings > 20000) { // NPR 200
    suggestions.push({
      type: 'UPGRADE_TO_PRO',
      message: 'Your high usage makes Pro tier cost-effective',
      potentialSavings: avgUsage.savings * 0.1 // 10% more savings
    });
  }

  if (tier === 'PRO' && avgUsage.bookings < 2) {
    suggestions.push({
      type: 'DOWNGRADE_CONSIDER',
      message: 'Consider Plus tier for better value with your usage pattern',
      potentialSavings: 30000 // Monthly savings
    });
  }

  return suggestions;
}

function generateUsageInsights(subscription: any, currentUsage: any, totalSavings: number) {
  const insights = [];

  // Savings insight
  if (totalSavings > 0) {
    insights.push({
      type: 'SAVINGS',
      title: 'Total Savings',
      value: `NPR ${Math.round(totalSavings / 100)}`,
      description: `You've saved NPR ${Math.round(totalSavings / 100)} with your ${subscription.tier} subscription!`
    });
  }

  // Usage pattern insights
  if (currentUsage.bookingsCount > 0) {
    const avgBookingValue = totalSavings / Math.max(currentUsage.bookingsCount, 1);
    insights.push({
      type: 'BOOKING_PATTERN',
      title: 'Booking Efficiency',
      value: `NPR ${Math.round(avgBookingValue / 100)} avg savings`,
      description: `You save an average of NPR ${Math.round(avgBookingValue / 100)} per booking`
    });
  }

  // Tier-specific insights
  if (subscription.tier === 'PLUS' && currentUsage.creditsUsed > 8000) {
    insights.push({
      type: 'CREDITS_HIGH_USAGE',
      title: 'Credit Usage',
      value: '80%+ used',
      description: 'You\'re making great use of your service credits!'
    });
  }

  // Support usage insight
  if (currentUsage.supportTickets > 0) {
    insights.push({
      type: 'SUPPORT_USAGE',
      title: 'Priority Support',
      value: `${currentUsage.supportTickets} tickets`,
      description: 'Your premium support benefits have been utilized'
    });
  }

  return insights;
}

function getUsageUpdateData(eventType: string, amount: number) {
  switch (eventType) {
    case 'BOOKING_CREATED':
      return { bookingsCount: { increment: 1 } };
    case 'DISCOUNT_APPLIED':
      return { discountUsed: { increment: amount } };
    case 'CREDITS_USED':
      return { creditsUsed: { increment: amount } };
    case 'SUPPORT_TICKET_CREATED':
      return { supportTickets: { increment: 1 } };
    default:
      return {};
  }
}

async function logUsageEvent(subscriptionId: string, eventType: string, amount: number = 1, bookingId?: string) {
  try {
    // This could be expanded to log detailed usage events for analytics
    console.log(`Usage event logged: ${eventType} for subscription ${subscriptionId}, amount: ${amount}`);
    
    // In a production system, you might want to store detailed event logs
    // for analytics and business intelligence purposes
  } catch (error) {
    console.error('Error logging usage event:', error);
  }
}