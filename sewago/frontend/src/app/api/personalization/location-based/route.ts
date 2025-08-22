import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { behaviorTracker } from '@/lib/personalization/behavior-tracker';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
    const area = searchParams.get('area');
    const radius = parseInt(searchParams.get('radius') || '10');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    let locationContext = { area, lat, lng, radius };

    // If no location provided, try to get from user preferences or insights
    if (!area && !lat && !lng) {
      const [preferences, insights] = await Promise.all([
        getUserPreferences(userId),
        getUserInsights(userId)
      ]);

      if (preferences?.locationPreferences?.areas?.length > 0) {
        locationContext.area = preferences.locationPreferences.areas[0];
      } else if (insights?.locationHotspots?.length > 0) {
        locationContext.area = insights.locationHotspots[0].area;
      }
    }

    if (!locationContext.area && !locationContext.lat) {
      return NextResponse.json({
        success: true,
        data: {
          recommendations: [],
          message: 'Please provide location to get location-based recommendations'
        }
      });
    }

    // Get location-based recommendations
    const recommendations = await getLocationBasedRecommendations(
      userId,
      locationContext,
      limit
    );

    // Get area insights
    const areaInsights = locationContext.area 
      ? await getAreaInsights(locationContext.area)
      : null;

    // Get nearby trending services
    const trendingServices = await getNearbyTrendingServices(
      locationContext,
      limit
    );

    // Track location-based request
    await behaviorTracker.trackEvent({
      userId,
      action: 'view',
      clickTarget: 'location_recommendations',
      location: locationContext,
      deviceType: request.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop'
    });

    return NextResponse.json({
      success: true,
      data: {
        location: locationContext,
        recommendations,
        areaInsights,
        trendingServices,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting location-based recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get location-based recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, location, action } = body;

    if (!userId || !location) {
      return NextResponse.json(
        { error: 'userId and location are required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'update_area_insights':
        result = await updateAreaInsights(location.area);
        break;
        
      case 'track_location_preference':
        result = await trackLocationPreference(userId, location);
        break;
        
      case 'get_area_comparison':
        const comparisonAreas = body.comparisonAreas || [];
        result = await getAreaComparison(location.area, comparisonAreas);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error processing location-based action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}

async function getUserPreferences(userId: string) {
  return await prisma.userPreferences.findUnique({
    where: { userId }
  });
}

async function getUserInsights(userId: string) {
  return await prisma.personalizationInsights.findUnique({
    where: { userId }
  });
}

async function getLocationBasedRecommendations(
  userId: string,
  locationContext: any,
  limit: number
) {
  const recommendations = [];

  // Get user's service history and preferences
  const [userBookings, userPreferences] = await Promise.all([
    getUserBookings(userId),
    getUserPreferences(userId)
  ]);

  // Get popular services in the area
  const areaInsights = locationContext.area 
    ? await getAreaInsights(locationContext.area)
    : null;

  if (areaInsights?.popularServices?.length > 0) {
    // Get services that are popular in this area
    const areaServices = await prisma.service.findMany({
      where: {
        category: { in: areaInsights.popularServices },
        city: locationContext.area,
        isActive: true
      },
      include: {
        reviews: true,
        bookings: {
          where: { status: 'COMPLETED' }
        }
      },
      take: limit * 2
    });

    for (const service of areaServices) {
      let score = 0.5; // Base location score

      // Popularity in area
      const popularityIndex = areaInsights.popularServices.indexOf(service.category);
      score += (areaInsights.popularServices.length - popularityIndex) / 
               areaInsights.popularServices.length * 0.3;

      // User preference alignment
      if (userPreferences?.preferredCategories?.includes(service.category)) {
        score += 0.3;
      }

      // Historical booking patterns
      const userCategoryBookings = userBookings.filter(
        b => b.service?.category === service.category
      );
      if (userCategoryBookings.length > 0) {
        score += Math.min(userCategoryBookings.length * 0.1, 0.2);
      }

      // Service quality
      const avgRating = service.reviews.length > 0 
        ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length
        : 0;
      score += (avgRating / 5) * 0.2;

      if (score > 0.3) {
        recommendations.push({
          serviceId: service.id,
          name: service.name,
          category: service.category,
          basePrice: service.basePrice,
          imageUrl: service.imageUrl,
          score: Math.min(score, 1.0),
          reason: `Popular in ${locationContext.area}`,
          locationFactors: {
            areaPopularity: popularityIndex + 1,
            localRating: avgRating,
            bookingVolume: service.bookings.length
          },
          distance: calculateDistance(locationContext, service)
        });
      }
    }
  }

  // If we have coordinates, find nearby services
  if (locationContext.lat && locationContext.lng) {
    const nearbyServices = await findNearbyServices(
      locationContext.lat,
      locationContext.lng,
      locationContext.radius,
      limit
    );

    for (const service of nearbyServices) {
      if (!recommendations.find(r => r.serviceId === service.id)) {
        recommendations.push({
          serviceId: service.id,
          name: service.name,
          category: service.category,
          basePrice: service.basePrice,
          imageUrl: service.imageUrl,
          score: 0.6,
          reason: `Near your location`,
          distance: service.distance,
          locationFactors: {
            proximity: `${service.distance.toFixed(1)}km away`,
            areaPopularity: null,
            localRating: service.avgRating
          }
        });
      }
    }
  }

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function getAreaInsights(area: string) {
  let insights = await prisma.locationInsights.findUnique({
    where: { area }
  });

  if (!insights) {
    // Generate insights for this area
    insights = await generateAreaInsights(area);
  }

  return insights;
}

async function generateAreaInsights(area: string) {
  // Get booking data for this area
  const areaBookings = await prisma.booking.findMany({
    where: {
      service: {
        city: area
      },
      status: 'COMPLETED'
    },
    include: {
      service: true,
      review: true
    },
    take: 1000 // Last 1000 bookings
  });

  // Calculate popular services
  const categoryFreq = new Map<string, number>();
  areaBookings.forEach(booking => {
    const category = booking.service?.category;
    if (category) {
      categoryFreq.set(category, (categoryFreq.get(category) || 0) + 1);
    }
  });

  const popularServices = Array.from(categoryFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([category]) => category);

  // Calculate peak times
  const timeFreq = new Map<string, number>();
  areaBookings.forEach(booking => {
    if (booking.scheduledAt) {
      const hour = new Date(booking.scheduledAt).getHours();
      const timeSlot = getTimeSlot(hour);
      timeFreq.set(timeSlot, (timeFreq.get(timeSlot) || 0) + 1);
    }
  });

  const peakTimes = Array.from(timeFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([time]) => time);

  // Calculate average pricing by category
  const categoryPricing = new Map<string, number[]>();
  areaBookings.forEach(booking => {
    const category = booking.service?.category;
    if (category && booking.total > 0) {
      if (!categoryPricing.has(category)) {
        categoryPricing.set(category, []);
      }
      categoryPricing.get(category)!.push(booking.total);
    }
  });

  const averagePricing: Record<string, number> = {};
  categoryPricing.forEach((prices, category) => {
    averagePricing[category] = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  });

  // Calculate seasonal trends
  const seasonalTrends = calculateSeasonalTrends(areaBookings);

  // Calculate demographics (simplified)
  const demographics = {
    totalUsers: new Set(areaBookings.map(b => b.userId)).size,
    avgBookingValue: areaBookings.reduce((sum, b) => sum + b.total, 0) / areaBookings.length,
    repeatCustomerRate: calculateRepeatCustomerRate(areaBookings)
  };

  // Count providers in area
  const providerDensity = await prisma.provider.count({
    where: {
      zones: { has: area }
    }
  });

  // Create or update location insights
  const insights = await prisma.locationInsights.upsert({
    where: { area },
    update: {
      popularServices,
      peakTimes,
      averagePricing,
      seasonalTrends,
      demographics,
      providerDensity
    },
    create: {
      area,
      popularServices,
      peakTimes,
      averagePricing,
      seasonalTrends,
      demographics,
      providerDensity
    }
  });

  return insights;
}

async function getNearbyTrendingServices(locationContext: any, limit: number) {
  if (!locationContext.area) return [];

  // Get recently popular services in the area
  const recentBookings = await prisma.booking.findMany({
    where: {
      service: {
        city: locationContext.area
      },
      status: 'COMPLETED',
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    include: {
      service: true
    }
  });

  // Count bookings per service
  const serviceFreq = new Map<string, { count: number; service: any }>();
  recentBookings.forEach(booking => {
    if (booking.service) {
      const current = serviceFreq.get(booking.serviceId) || { count: 0, service: booking.service };
      current.count++;
      serviceFreq.set(booking.serviceId, current);
    }
  });

  // Sort by booking frequency and get top trending
  const trending = Array.from(serviceFreq.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([serviceId, data]) => ({
      serviceId,
      name: data.service.name,
      category: data.service.category,
      basePrice: data.service.basePrice,
      imageUrl: data.service.imageUrl,
      trendingScore: data.count,
      reason: `${data.count} recent bookings in ${locationContext.area}`
    }));

  return trending;
}

async function getUserBookings(userId: string) {
  return await prisma.booking.findMany({
    where: { userId },
    include: {
      service: true
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
}

async function updateAreaInsights(area: string) {
  const insights = await generateAreaInsights(area);
  return {
    message: `Area insights updated for ${area}`,
    insights
  };
}

async function trackLocationPreference(userId: string, location: any) {
  // Update user preferences with location data
  await prisma.userPreferences.upsert({
    where: { userId },
    update: {
      locationPreferences: {
        areas: location.area ? [location.area] : [],
        radius: location.radius || 10
      }
    },
    create: {
      userId,
      preferredCategories: [],
      preferredTimeSlots: [],
      preferredProviders: [],
      budgetRange: { min: 500, max: 5000 },
      locationPreferences: {
        areas: location.area ? [location.area] : [],
        radius: location.radius || 10
      },
      serviceFrequency: {},
      personalizedSettings: {},
      culturalPreferences: {},
      languagePreference: 'en',
      notificationPreferences: {}
    }
  });

  return {
    message: 'Location preference updated successfully'
  };
}

async function getAreaComparison(primaryArea: string, comparisonAreas: string[]) {
  const areas = [primaryArea, ...comparisonAreas];
  const comparisons = [];

  for (const area of areas) {
    const insights = await getAreaInsights(area);
    if (insights) {
      comparisons.push({
        area,
        popularServices: insights.popularServices.slice(0, 5),
        providerDensity: insights.providerDensity,
        avgPricing: insights.averagePricing,
        peakTimes: insights.peakTimes
      });
    }
  }

  return {
    primaryArea,
    comparisons,
    summary: generateAreaComparisonSummary(comparisons)
  };
}

// Helper functions

async function findNearbyServices(lat: number, lng: number, radius: number, limit: number) {
  // In a real implementation, this would use geospatial queries
  // For now, return a simplified structure
  const services = await prisma.service.findMany({
    where: { isActive: true },
    include: {
      reviews: true
    },
    take: limit
  });

  return services.map(service => ({
    ...service,
    distance: Math.random() * radius, // Simplified distance calculation
    avgRating: service.reviews.length > 0 
      ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length
      : 0
  }));
}

function calculateDistance(locationContext: any, service: any): number | null {
  if (!locationContext.lat || !locationContext.lng) return null;
  
  // In a real implementation, this would calculate actual distance
  // For now, return a random distance within radius
  return Math.random() * (locationContext.radius || 10);
}

function getTimeSlot(hour: number): string {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function calculateSeasonalTrends(bookings: any[]) {
  const seasonalData: Record<string, Record<string, number>> = {
    spring: {},
    summer: {},
    autumn: {},
    winter: {}
  };

  bookings.forEach(booking => {
    const month = new Date(booking.createdAt).getMonth() + 1;
    const season = getSeason(month);
    const category = booking.service?.category;
    
    if (season && category) {
      seasonalData[season][category] = (seasonalData[season][category] || 0) + 1;
    }
  });

  // Convert to top categories per season
  const trends: Record<string, string[]> = {};
  Object.keys(seasonalData).forEach(season => {
    trends[season] = Object.entries(seasonalData[season])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category);
  });

  return trends;
}

function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function calculateRepeatCustomerRate(bookings: any[]): number {
  const userBookingCounts = new Map<string, number>();
  
  bookings.forEach(booking => {
    userBookingCounts.set(
      booking.userId, 
      (userBookingCounts.get(booking.userId) || 0) + 1
    );
  });

  const repeatCustomers = Array.from(userBookingCounts.values())
    .filter(count => count > 1).length;
    
  return userBookingCounts.size > 0 ? repeatCustomers / userBookingCounts.size : 0;
}

function generateAreaComparisonSummary(comparisons: any[]) {
  if (comparisons.length < 2) return null;

  const primary = comparisons[0];
  const others = comparisons.slice(1);

  return {
    serviceVariety: primary.popularServices.length >= 5 ? 'high' : 'medium',
    providerAvailability: primary.providerDensity > 50 ? 'excellent' : 'good',
    competitiveAnalysis: others.map(area => ({
      area: area.area,
      comparison: area.providerDensity > primary.providerDensity ? 'more_providers' : 'fewer_providers'
    }))
  };
}