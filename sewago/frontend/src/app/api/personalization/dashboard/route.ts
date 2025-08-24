// GET /api/personalization/dashboard - Personalized dashboard data
import { NextRequest, NextResponse } from 'next/server';
import { RecommendationEngine } from '@/lib/personalization/recommendation-engine';
import { PersonalizationDashboardData, PersonalizationAPIResponse } from '@/types/personalization';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const recommendationEngine = new RecommendationEngine();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Fetch user data
    const [user, userPreferences, insights, upcomingBookings, recentBookings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          loyaltyPoints: true,
          badges: true,
        },
      }),
      prisma.userPreferences.findUnique({
        where: { userId },
      }),
      prisma.personalizationInsights.findUnique({
        where: { userId },
      }),
      prisma.booking.findMany({
        where: {
          userId,
          status: { in: ['CONFIRMED', 'PROVIDER_ASSIGNED', 'EN_ROUTE'] },
        },
        include: {
          service: true,
          provider: true,
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),
      prisma.booking.findMany({
        where: {
          userId,
          status: 'COMPLETED',
        },
        include: {
          service: true,
          provider: true,
        },
        orderBy: { completedAt: 'desc' },
        take: 10,
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get personalized recommendations
    const [serviceRecommendations, providerRecommendations, personalizedOffers] = await Promise.all([
      recommendationEngine.getServiceRecommendations({
        userId,
        algorithm: 'hybrid',
        limit: 8,
      }),
      recommendationEngine.getProviderRecommendations({
        userId,
        algorithm: 'hybrid',
        limit: 4,
      }),
      recommendationEngine.getPersonalizedOffers(userId),
    ]);

    // Calculate usage insights
    const usageInsights = calculateUsageInsights(recentBookings, insights);

    // Generate quick actions based on user behavior
    const quickActions = generateQuickActions(user, insights, userPreferences);

    // Generate recent activity
    const recentActivity = generateRecentActivity(recentBookings, upcomingBookings);

    // Generate goals based on user behavior
    const goals = generatePersonalizedGoals(user, insights);

    // Construct dashboard data
    const dashboardData: PersonalizationDashboardData = {
      user: {
        name: user.name || 'Valued Customer',
        memberSince: user.createdAt.toISOString(),
        tier: user.loyaltyPoints?.totalPoints ? 
          (user.loyaltyPoints.totalPoints > 10000 ? 'Premium' : 
           user.loyaltyPoints.totalPoints > 5000 ? 'Gold' : 
           user.loyaltyPoints.totalPoints > 1000 ? 'Silver' : 'Bronze') : 'Bronze',
        points: user.loyaltyPoints?.availablePoints || 0,
      },
      quickActions,
      recommendations: {
        services: serviceRecommendations,
        providers: providerRecommendations,
        offers: personalizedOffers,
      },
      insights: usageInsights,
      upcomingBookings: upcomingBookings.map(booking => ({
        id: booking.id,
        serviceName: booking.service.name,
        providerName: booking.provider?.name || 'Provider Pending',
        scheduledAt: booking.scheduledAt?.toISOString() || '',
        status: booking.status,
      })),
      recentActivity,
      goals,
    };

    const processingTime = Date.now() - startTime;

    const response: PersonalizationAPIResponse<PersonalizationDashboardData> = {
      success: true,
      data: dashboardData,
      metadata: {
        processingTime,
        algorithm: 'dashboard-hybrid',
        cacheHit: false,
        version: '1.0.0',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating personalized dashboard:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateUsageInsights(recentBookings: any[], insights: any) {
  const totalBookings = recentBookings.length;
  const totalSpent = recentBookings.reduce((sum, booking) => sum + booking.total, 0);
  const averageRating = insights?.averageSpending || 0;

  // Calculate category frequencies
  const categoryMap = new Map<string, number>();
  recentBookings.forEach(booking => {
    const category = booking.service.category;
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
  });

  const favoriteCategories = Array.from(categoryMap.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / totalBookings) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Provider loyalty
  const providerMap = new Map<string, { name: string; count: number }>();
  recentBookings.forEach(booking => {
    if (booking.provider) {
      const existing = providerMap.get(booking.provider.id);
      if (existing) {
        existing.count++;
      } else {
        providerMap.set(booking.provider.id, {
          name: booking.provider.name,
          count: 1,
        });
      }
    }
  });

  const providerLoyalty = Array.from(providerMap.entries())
    .map(([providerId, data]) => ({
      providerId,
      providerName: data.name,
      bookingCount: data.count,
    }))
    .sort((a, b) => b.bookingCount - a.bookingCount)
    .slice(0, 3);

  return {
    period: 'month' as const,
    totalBookings,
    totalSpent,
    averageRating: 4.5, // Would calculate from reviews
    favoriteCategories,
    providerLoyalty,
    timePatterns: [
      { day: 'Saturday', hour: 10, frequency: 8 },
      { day: 'Sunday', hour: 14, frequency: 6 },
      { day: 'Friday', hour: 16, frequency: 4 },
    ],
    savingsAchieved: Math.floor(totalSpent * 0.15), // Estimated savings from offers
    comparisons: {
      previousPeriod: {
        bookings: Math.max(0, totalBookings - 2),
        spent: Math.max(0, totalSpent - 1000),
        growth: totalBookings > 0 ? 15 : 0,
      },
      averageUser: {
        bookings: 3,
        spent: 5000,
        comparison: totalBookings > 3 ? 'above' : totalBookings < 2 ? 'below' : 'similar',
      },
    },
  };
}

function generateQuickActions(user: any, insights: any, preferences: any) {
  const actions = [];

  // Suggest based on top categories
  if (insights?.topCategories?.length > 0) {
    actions.push({
      label: `Book ${insights.topCategories[0]}`,
      action: `book_${insights.topCategories[0].toLowerCase()}`,
      icon: 'calendar',
      priority: 10,
    });
  }

  // Repeat last service
  actions.push({
    label: 'Repeat Last Service',
    action: 'repeat_last_service',
    icon: 'refresh',
    priority: 8,
  });

  // View offers
  actions.push({
    label: 'View Personalized Offers',
    action: 'view_offers',
    icon: 'gift',
    priority: 7,
  });

  // Update preferences
  if (!preferences) {
    actions.push({
      label: 'Complete Your Profile',
      action: 'complete_preferences',
      icon: 'user',
      priority: 9,
    });
  }

  return actions.sort((a, b) => b.priority - a.priority).slice(0, 4);
}

function generateRecentActivity(recentBookings: any[], upcomingBookings: any[]) {
  const activities = [];

  // Recent completions
  recentBookings.slice(0, 3).forEach(booking => {
    activities.push({
      type: 'booking_completed',
      description: `Completed ${booking.service.name} with ${booking.provider?.name || 'provider'}`,
      timestamp: booking.completedAt,
    });
  });

  // Upcoming bookings
  upcomingBookings.slice(0, 2).forEach(booking => {
    activities.push({
      type: 'booking_scheduled',
      description: `Scheduled ${booking.service.name} for ${booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleDateString() : 'soon'}`,
      timestamp: booking.createdAt,
    });
  });

  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
}

function generatePersonalizedGoals(user: any, insights: any) {
  const goals = [];

  // Loyalty points goal
  const currentPoints = user.loyaltyPoints?.availablePoints || 0;
  const nextTierPoints = currentPoints < 1000 ? 1000 : 
                        currentPoints < 5000 ? 5000 : 10000;
  
  goals.push({
    title: 'Reach Next Loyalty Tier',
    current: currentPoints,
    target: nextTierPoints,
    reward: 'Special tier benefits and discounts',
  });

  // Monthly booking goal
  const monthlyBookings = insights?.bookingPatterns?.bookingFrequency || 0;
  if (monthlyBookings < 4) {
    goals.push({
      title: 'Complete 4 Services This Month',
      current: monthlyBookings,
      target: 4,
      reward: '10% bonus points on all services',
    });
  }

  // Review goal
  goals.push({
    title: 'Leave 3 Helpful Reviews',
    current: 1, // Would track actual reviews
    target: 3,
    reward: '500 bonus loyalty points',
  });

  return goals;
}