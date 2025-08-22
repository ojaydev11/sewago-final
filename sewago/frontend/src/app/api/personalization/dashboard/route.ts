import { NextRequest, NextResponse } from 'next/server';
import { recommendationEngine } from '@/lib/personalization/recommendation-engine';
import { behaviorTracker } from '@/lib/personalization/behavior-tracker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get user insights and preferences
    const [insights, preferences, recentBookings] = await Promise.all([
      behaviorTracker.getUserInsights(userId),
      getUserPreferences(userId),
      getRecentBookings(userId)
    ]);

    // Get personalized recommendations
    const context = {
      userId,
      timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                new Date().getHours() < 17 ? 'afternoon' : 'evening',
      season: getCurrentSeason(),
      deviceType: request.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop'
    };

    const [
      serviceRecommendations,
      locationBasedSuggestions,
      seasonalRecommendations,
      personalizedOffers
    ] = await Promise.all([
      recommendationEngine.getServiceRecommendations(context, 8),
      getLocationBasedSuggestions(userId, insights),
      getSeasonalRecommendations(userId),
      getPersonalizedOffers(userId, insights)
    ]);

    // Get usage insights
    const usageInsights = await getUsageInsights(userId, recentBookings);

    // Get smart scheduling suggestions
    const smartScheduling = await getSmartSchedulingSuggestions(userId, insights);

    // Track dashboard view
    await behaviorTracker.trackEvent({
      userId,
      action: 'view',
      clickTarget: 'personalized_dashboard',
      deviceType: context.deviceType,
      sessionId: request.headers.get('x-session-id') || undefined
    });

    const dashboardData = {
      user: {
        preferences,
        insights
      },
      recommendations: {
        services: serviceRecommendations,
        location: locationBasedSuggestions,
        seasonal: seasonalRecommendations,
        offers: personalizedOffers
      },
      analytics: {
        usage: usageInsights,
        scheduling: smartScheduling
      },
      recentActivity: recentBookings.slice(0, 5),
      personalizedGreeting: generatePersonalizedGreeting(userId, insights),
      quickActions: generateQuickActions(insights, preferences),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error getting personalized dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to load personalized dashboard' },
      { status: 500 }
    );
  }
}

async function getUserPreferences(userId: string) {
  return await prisma.userPreferences.findUnique({
    where: { userId }
  });
}

async function getRecentBookings(userId: string) {
  return await prisma.booking.findMany({
    where: { userId },
    include: {
      service: true,
      review: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
}

async function getLocationBasedSuggestions(userId: string, insights: any) {
  if (!insights?.locationHotspots?.length) {
    return [];
  }

  const topArea = insights.locationHotspots[0].area;
  
  // Get popular services in user's most frequent area
  const locationInsights = await prisma.locationInsights.findUnique({
    where: { area: topArea }
  });

  if (!locationInsights?.popularServices?.length) {
    return [];
  }

  const services = await prisma.service.findMany({
    where: {
      category: { in: locationInsights.popularServices },
      city: topArea,
      isActive: true
    },
    include: {
      reviews: true
    },
    take: 5
  });

  return services.map(service => ({
    id: service.id,
    name: service.name,
    category: service.category,
    basePrice: service.basePrice,
    imageUrl: service.imageUrl,
    avgRating: service.reviews.length > 0 
      ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length
      : 0,
    reason: `Popular in ${topArea}`
  }));
}

async function getSeasonalRecommendations(userId: string) {
  const currentMonth = new Date().getMonth() + 1;
  const season = getCurrentSeason();
  
  // Get current Nepali festival if any
  const currentFestival = getCurrentNepaliEvent();
  
  let seasonalCategories = getSeasonalCategories(season);
  if (currentFestival) {
    seasonalCategories = [...seasonalCategories, ...getFestivalCategories(currentFestival)];
  }

  if (seasonalCategories.length === 0) {
    return [];
  }

  const services = await prisma.service.findMany({
    where: {
      category: { in: seasonalCategories },
      isActive: true
    },
    include: {
      reviews: true
    },
    take: 6
  });

  return services.map(service => ({
    id: service.id,
    name: service.name,
    category: service.category,
    basePrice: service.basePrice,
    imageUrl: service.imageUrl,
    avgRating: service.reviews.length > 0 
      ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length
      : 0,
    reason: currentFestival 
      ? `Perfect for ${currentFestival}` 
      : `Great for ${season} season`,
    seasonal: true,
    festival: currentFestival
  }));
}

async function getPersonalizedOffers(userId: string, insights: any) {
  // Generate personalized offers based on user behavior
  const offers = [];

  if (insights?.topCategories?.length > 0) {
    const topCategory = insights.topCategories[0];
    offers.push({
      id: `discount_${topCategory}`,
      title: `15% off ${topCategory} services`,
      description: `Based on your interest in ${topCategory}`,
      discount: 15,
      category: topCategory,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      reason: `You've used ${topCategory} services frequently`
    });
  }

  if (insights?.personalityProfile?.bookingFrequency === 'frequent') {
    offers.push({
      id: 'loyalty_bonus',
      title: 'Loyalty Bonus: 20% off next booking',
      description: 'Thank you for being a frequent customer!',
      discount: 20,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      reason: 'Frequent customer reward'
    });
  }

  if (insights?.averageSpending > 0) {
    const spendingTier = insights.averageSpending > 3000 ? 'premium' : 'standard';
    if (spendingTier === 'premium') {
      offers.push({
        id: 'premium_perks',
        title: 'Premium Customer Perks',
        description: 'Free priority booking + 10% cashback',
        cashback: 10,
        perks: ['priority_booking', 'extended_warranty'],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        reason: 'High-value customer benefits'
      });
    }
  }

  return offers;
}

async function getUsageInsights(userId: string, recentBookings: any[]) {
  const completedBookings = recentBookings.filter(b => b.status === 'COMPLETED');
  
  const totalSpent = completedBookings.reduce((sum, b) => sum + b.total, 0);
  const avgRating = completedBookings
    .filter(b => b.review)
    .reduce((sum, b, _, arr) => sum + b.review.rating / arr.length, 0);

  const categoryBreakdown = new Map();
  completedBookings.forEach(b => {
    const category = b.service?.category;
    if (category) {
      categoryBreakdown.set(category, (categoryBreakdown.get(category) || 0) + 1);
    }
  });

  return {
    totalBookings: completedBookings.length,
    totalSpent,
    averageRating: Math.round(avgRating * 10) / 10,
    favoriteCategory: Array.from(categoryBreakdown.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    categoryBreakdown: Object.fromEntries(categoryBreakdown),
    monthlyTrend: calculateMonthlyTrend(completedBookings),
    savingsFromOffers: calculateSavingsFromOffers(completedBookings)
  };
}

async function getSmartSchedulingSuggestions(userId: string, insights: any) {
  const suggestions = [];

  if (insights?.mostBookedTimes?.length > 0) {
    const preferredTime = insights.mostBookedTimes[0];
    suggestions.push({
      type: 'optimal_time',
      title: `Book during ${preferredTime} for best experience`,
      description: `Based on your booking history, you prefer ${preferredTime} slots`,
      timeSlot: preferredTime,
      reason: 'historical_preference'
    });
  }

  if (insights?.bookingPatterns?.preferredDays?.length > 0) {
    const preferredDay = insights.bookingPatterns.preferredDays[0];
    suggestions.push({
      type: 'optimal_day',
      title: `${preferredDay}s work best for you`,
      description: `You typically book services on ${preferredDay}s`,
      day: preferredDay,
      reason: 'pattern_analysis'
    });
  }

  // Add seasonal suggestions
  const currentSeason = getCurrentSeason();
  if (insights?.seasonalPatterns?.[currentSeason]?.length > 0) {
    const seasonalService = insights.seasonalPatterns[currentSeason][0];
    suggestions.push({
      type: 'seasonal_reminder',
      title: `Consider booking ${seasonalService} services`,
      description: `Based on your ${currentSeason} pattern last year`,
      category: seasonalService,
      reason: 'seasonal_pattern'
    });
  }

  return suggestions;
}

function generatePersonalizedGreeting(userId: string, insights: any): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  
  if (insights?.personalityProfile?.bookingFrequency === 'frequent') {
    return `${timeGreeting}! Ready for your next service booking?`;
  }
  
  if (insights?.topCategories?.length > 0) {
    const topCategory = insights.topCategories[0];
    return `${timeGreeting}! Looking for ${topCategory} services today?`;
  }
  
  return `${timeGreeting}! What service can we help you with today?`;
}

function generateQuickActions(insights: any, preferences: any): Array<{
  id: string;
  title: string;
  icon: string;
  action: string;
  category?: string;
}> {
  const actions = [];
  
  if (insights?.topCategories?.length > 0) {
    const topCategory = insights.topCategories[0];
    actions.push({
      id: 'book_favorite',
      title: `Book ${topCategory}`,
      icon: 'bookmark',
      action: 'book_service',
      category: topCategory
    });
  }
  
  actions.push(
    {
      id: 'search_services',
      title: 'Search Services',
      icon: 'search',
      action: 'search'
    },
    {
      id: 'view_bookings',
      title: 'My Bookings',
      icon: 'calendar',
      action: 'view_bookings'
    },
    {
      id: 'track_order',
      title: 'Track Order',
      icon: 'location',
      action: 'track_order'
    }
  );

  if (insights?.personalityProfile?.bookingFrequency === 'frequent') {
    actions.push({
      id: 'loyalty_points',
      title: 'Loyalty Points',
      icon: 'gift',
      action: 'view_points'
    });
  }

  return actions;
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function getCurrentNepaliEvent(): string | null {
  const now = new Date();
  const month = now.getMonth() + 1;
  
  // Simplified Nepali festival calendar
  const festivals = [
    { name: 'Dashain', months: [9, 10] },
    { name: 'Tihar', months: [10, 11] },
    { name: 'Holi', months: [3, 4] },
    { name: 'New Year', months: [4] }
  ];

  for (const festival of festivals) {
    if (festival.months.includes(month)) {
      return festival.name;
    }
  }
  return null;
}

function getSeasonalCategories(season: string): string[] {
  const seasonalServices: Record<string, string[]> = {
    spring: ['Cleaning', 'Gardening', 'Renovation'],
    summer: ['AC Repair', 'Plumbing', 'Electrical'],
    autumn: ['Home Maintenance', 'Furniture Repair'],
    winter: ['Heating Repair', 'Home Security']
  };
  return seasonalServices[season] || [];
}

function getFestivalCategories(festival: string): string[] {
  const festivalServices: Record<string, string[]> = {
    'Dashain': ['Deep Cleaning', 'Home Decoration', 'Cooking'],
    'Tihar': ['Electrical', 'Decoration', 'Cleaning'],
    'Holi': ['Cleaning', 'Laundry', 'Painting'],
    'New Year': ['Deep Cleaning', 'Home Organization']
  };
  return festivalServices[festival] || [];
}

function calculateMonthlyTrend(bookings: any[]): Array<{ month: string; count: number; spending: number }> {
  const monthData = new Map();
  
  bookings.forEach(booking => {
    const month = new Date(booking.createdAt).toLocaleDateString('en', { month: 'short' });
    const current = monthData.get(month) || { count: 0, spending: 0 };
    current.count++;
    current.spending += booking.total;
    monthData.set(month, current);
  });

  return Array.from(monthData.entries()).map(([month, data]) => ({
    month,
    count: data.count,
    spending: data.spending
  }));
}

function calculateSavingsFromOffers(bookings: any[]): number {
  // This would calculate actual savings from applied offers
  // For now, return a simple estimate
  return bookings.length * 150; // Average savings per booking
}