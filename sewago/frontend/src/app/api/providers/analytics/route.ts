import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const analyticsQuerySchema = z.object({
  providerId: z.string().optional(),
  timeframe: z.enum(['1w', '1m', '3m', '6m', '1y']).default('1m'),
  metrics: z.array(z.string()).optional(),
});

// GET /api/providers/analytics - Get provider analytics
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const providerId = url.searchParams.get('providerId');
    const timeframe = url.searchParams.get('timeframe') || '1m';
    const metricsParam = url.searchParams.get('metrics');
    
    const metrics = metricsParam ? metricsParam.split(',') : undefined;

    // Validate query parameters
    const validatedQuery = analyticsQuerySchema.parse({
      providerId: providerId || undefined,
      timeframe,
      metrics,
    });

    // Calculate date range based on timeframe
    const now = new Date();
    const timeRanges = {
      '1w': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '1m': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '3m': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      '6m': new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
    };

    const fromDate = timeRanges[validatedQuery.timeframe as keyof typeof timeRanges];

    if (validatedQuery.providerId) {
      // Get analytics for specific provider
      const analytics = await prisma.providerAnalytics.findUnique({
        where: { providerId: validatedQuery.providerId },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              tier: true,
              skills: true,
              zones: true,
            }
          }
        }
      });

      if (!analytics) {
        return NextResponse.json(
          { error: 'Provider analytics not found' },
          { status: 404 }
        );
      }

      // Get historical performance data
      const bookings = await prisma.booking.findMany({
        where: {
          providerId: validatedQuery.providerId,
          createdAt: { gte: fromDate },
        },
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
          completedAt: true,
          service: {
            select: {
              category: true,
              name: true,
            }
          }
        },
        orderBy: { createdAt: 'asc' },
      });

      // Get reviews for ratings trend
      const reviews = await prisma.review.findMany({
        where: {
          booking: {
            providerId: validatedQuery.providerId,
          },
          createdAt: { gte: fromDate },
        },
        select: {
          rating: true,
          createdAt: true,
          text: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      // Calculate trends and performance metrics
      const performanceData = calculatePerformanceMetrics(bookings, reviews, fromDate);

      return NextResponse.json({
        analytics,
        performance: performanceData,
        timeframe: validatedQuery.timeframe,
      });
    } else {
      // Get aggregated analytics for all providers
      const allAnalytics = await prisma.providerAnalytics.findMany({
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              tier: true,
              zones: true,
            }
          }
        },
        orderBy: [
          { totalRevenue: 'desc' },
          { averageRating: 'desc' },
        ],
        take: 50, // Limit for performance
      });

      // Get platform-wide metrics
      const platformMetrics = await calculatePlatformMetrics(fromDate);

      return NextResponse.json({
        providers: allAnalytics,
        platform: platformMetrics,
        timeframe: validatedQuery.timeframe,
      });
    }
  } catch (error) {
    console.error('Provider analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider analytics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/providers/analytics - Update provider analytics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId } = body;

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Calculate real-time analytics for the provider
    const analytics = await calculateProviderAnalytics(providerId);

    // Upsert the analytics data
    const updatedAnalytics = await prisma.providerAnalytics.upsert({
      where: { providerId },
      update: {
        ...analytics,
        lastUpdated: new Date(),
      },
      create: {
        providerId,
        ...analytics,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            tier: true,
          }
        }
      }
    });

    return NextResponse.json(updatedAnalytics);
  } catch (error) {
    console.error('Update provider analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to update provider analytics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to calculate provider analytics
async function calculateProviderAnalytics(providerId: string) {
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Get all bookings for the provider
  const allBookings = await prisma.booking.findMany({
    where: { providerId },
    include: {
      review: true,
      service: { select: { category: true } },
    },
  });

  const currentMonthBookings = allBookings.filter(
    b => b.createdAt >= oneMonthAgo
  );
  const previousMonthBookings = allBookings.filter(
    b => b.createdAt >= twoMonthsAgo && b.createdAt < oneMonthAgo
  );

  const completedBookings = allBookings.filter(
    b => b.status === 'COMPLETED'
  );
  
  const totalRevenue = completedBookings.reduce((sum, b) => sum + b.total, 0);
  const currentMonthRevenue = currentMonthBookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.total, 0);
  const previousMonthRevenue = previousMonthBookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.total, 0);

  // Calculate ratings
  const reviews = allBookings.filter(b => b.review).map(b => b.review!);
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  // Calculate completion rate
  const completionRate = allBookings.length > 0 
    ? (completedBookings.length / allBookings.length) * 100 
    : 0;

  // Calculate response time (mock data - would need real response time tracking)
  const responseTime = Math.floor(Math.random() * 30) + 5; // 5-35 minutes

  // Calculate customer retention (customers with multiple bookings)
  const uniqueCustomers = [...new Set(allBookings.map(b => b.userId))];
  const returningCustomers = uniqueCustomers.filter(userId => 
    allBookings.filter(b => b.userId === userId).length > 1
  );
  const customerRetention = uniqueCustomers.length > 0 
    ? (returningCustomers.length / uniqueCustomers.length) * 100 
    : 0;

  // Calculate growth rate
  const growthRate = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
    : 0;

  // Calculate market share (mock data - would need category-wide data)
  const marketShare = Math.random() * 15; // 0-15%

  // Calculate customer loyalty (repeat bookings in last 3 months)
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const recentBookings = allBookings.filter(b => b.createdAt >= threeMonthsAgo);
  const recentCustomers = [...new Set(recentBookings.map(b => b.userId))];
  const loyalCustomers = recentCustomers.filter(userId =>
    recentBookings.filter(b => b.userId === userId).length >= 2
  );
  const customerLoyalty = recentCustomers.length > 0 
    ? (loyalCustomers.length / recentCustomers.length) * 100 
    : 0;

  return {
    totalBookings: allBookings.length,
    completedBookings: completedBookings.length,
    totalRevenue,
    averageRating,
    responseTime,
    completionRate,
    customerRetention,
    growthRate,
    marketShare,
    customerLoyalty,
  };
}

// Helper function to calculate performance metrics
function calculatePerformanceMetrics(bookings: any[], reviews: any[], fromDate: Date) {
  const dailyMetrics = new Map();
  
  // Initialize daily metrics
  const daysDiff = Math.ceil((Date.now() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  for (let i = 0; i < daysDiff; i++) {
    const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    dailyMetrics.set(dateStr, {
      date: dateStr,
      bookings: 0,
      completedBookings: 0,
      revenue: 0,
      averageRating: 0,
      reviewCount: 0,
    });
  }

  // Aggregate booking data by day
  bookings.forEach(booking => {
    const dateStr = booking.createdAt.toISOString().split('T')[0];
    if (dailyMetrics.has(dateStr)) {
      const dayData = dailyMetrics.get(dateStr);
      dayData.bookings++;
      if (booking.status === 'COMPLETED') {
        dayData.completedBookings++;
        dayData.revenue += booking.total;
      }
    }
  });

  // Aggregate review data by day
  reviews.forEach(review => {
    const dateStr = review.createdAt.toISOString().split('T')[0];
    if (dailyMetrics.has(dateStr)) {
      const dayData = dailyMetrics.get(dateStr);
      dayData.reviewCount++;
      dayData.averageRating = (dayData.averageRating * (dayData.reviewCount - 1) + review.rating) / dayData.reviewCount;
    }
  });

  return Array.from(dailyMetrics.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// Helper function to calculate platform-wide metrics
async function calculatePlatformMetrics(fromDate: Date) {
  const totalBookings = await prisma.booking.count({
    where: { createdAt: { gte: fromDate } }
  });

  const completedBookings = await prisma.booking.count({
    where: {
      createdAt: { gte: fromDate },
      status: 'COMPLETED'
    }
  });

  const totalRevenue = await prisma.booking.aggregate({
    where: {
      createdAt: { gte: fromDate },
      status: 'COMPLETED'
    },
    _sum: { total: true }
  });

  const averageRating = await prisma.review.aggregate({
    where: { createdAt: { gte: fromDate } },
    _avg: { rating: true }
  });

  const activeProviders = await prisma.provider.count({
    where: {
      bookings: {
        some: {
          createdAt: { gte: fromDate }
        }
      }
    }
  });

  return {
    totalBookings,
    completedBookings,
    totalRevenue: totalRevenue._sum.total || 0,
    averageRating: averageRating._avg.rating || 0,
    activeProviders,
    conversionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
  };
}