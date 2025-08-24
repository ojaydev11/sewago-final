import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const metricsQuerySchema = z.object({
  timeframe: z.enum(['1w', '1m', '3m', '6m', '1y', 'all']).default('1m'),
  granularity: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  metrics: z.array(z.string()).optional(),
  includeForecasting: z.boolean().default(false),
  includeSegmentation: z.boolean().default(false),
});

// GET /api/marketplace/growth-metrics - Get platform growth metrics
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryParams = {
      timeframe: url.searchParams.get('timeframe') || '1m',
      granularity: url.searchParams.get('granularity') || 'daily',
      metrics: url.searchParams.get('metrics')?.split(',') || undefined,
      includeForecasting: url.searchParams.get('includeForecasting') === 'true',
      includeSegmentation: url.searchParams.get('includeSegmentation') === 'true',
    };

    const validatedQuery = metricsQuerySchema.parse(queryParams);

    // Calculate date range
    const now = new Date();
    const timeRanges = {
      '1w': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '1m': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '3m': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      '6m': new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      'all': new Date(2023, 0, 1), // Platform launch date
    };

    const fromDate = timeRanges[validatedQuery.timeframe as keyof typeof timeRanges];

    // Get historical growth metrics
    const historicalMetrics = await prisma.growthMetrics.findMany({
      where: {
        date: { gte: fromDate },
      },
      orderBy: { date: 'asc' },
    });

    // Calculate real-time current metrics
    const currentMetrics = await calculateCurrentMetrics();

    // Process metrics based on granularity
    const processedMetrics = processMetricsByGranularity(
      historicalMetrics, 
      validatedQuery.granularity,
      fromDate
    );

    // Calculate growth trends and rates
    const growthAnalysis = calculateGrowthTrends(processedMetrics);

    // Get market insights if segmentation is requested
    let segmentation = null;
    if (validatedQuery.includeSegmentation) {
      segmentation = await getMarketSegmentation(fromDate);
    }

    // Generate forecasting if requested
    let forecasting = null;
    if (validatedQuery.includeForecasting) {
      forecasting = await generateGrowthForecasting(processedMetrics);
    }

    // Calculate key performance indicators
    const kpis = calculateKeyPerformanceIndicators(processedMetrics, currentMetrics);

    return NextResponse.json({
      currentMetrics,
      historicalMetrics: processedMetrics,
      growthAnalysis,
      kpis,
      segmentation,
      forecasting,
      timeframe: validatedQuery.timeframe,
      granularity: validatedQuery.granularity,
    });
  } catch (error) {
    console.error('Growth metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch growth metrics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/marketplace/growth-metrics - Update/recalculate metrics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { forceRecalculate = false, dateRange } = body;

    // Determine date range for calculation
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 1); // Yesterday by default

    if (dateRange) {
      startDate = new Date(dateRange.start);
    }

    const endDate = dateRange ? new Date(dateRange.end) : new Date();

    // Calculate metrics for each day in the range
    const updatedMetrics = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayMetrics = await calculateDailyMetrics(new Date(currentDate));
      
      // Upsert metrics for this day
      const upsertedMetric = await prisma.growthMetrics.upsert({
        where: { date: new Date(currentDate) },
        update: dayMetrics,
        create: {
          date: new Date(currentDate),
          ...dayMetrics,
        },
      });

      updatedMetrics.push(upsertedMetric);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Update marketplace insights
    await updateMarketplaceInsights(startDate, endDate);

    return NextResponse.json({
      message: 'Growth metrics updated successfully',
      updatedDays: updatedMetrics.length,
      metrics: updatedMetrics,
    });
  } catch (error) {
    console.error('Update growth metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to update growth metrics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to calculate current real-time metrics
async function calculateCurrentMetrics() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  // Total users
  const totalUsers = await prisma.user.count();
  const newUsersToday = await prisma.user.count({
    where: { createdAt: { gte: today } },
  });
  const newUsersYesterday = await prisma.user.count({
    where: { 
      createdAt: { gte: yesterday, lt: today },
    },
  });

  // Active users (users with bookings in last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const activeUsers = await prisma.user.count({
    where: {
      bookings: {
        some: {
          createdAt: { gte: thirtyDaysAgo },
        },
      },
    },
  });

  // Provider metrics
  const totalProviders = await prisma.provider.count();
  const newProvidersToday = await prisma.provider.count({
    where: { createdAt: { gte: today } },
  });
  const activeProviders = await prisma.provider.count({
    where: {
      bookings: {
        some: {
          createdAt: { gte: thirtyDaysAgo },
        },
      },
    },
  });

  // Booking metrics
  const totalBookings = await prisma.booking.count();
  const totalBookingsToday = await prisma.booking.count({
    where: { createdAt: { gte: today } },
  });
  const completedBookings = await prisma.booking.count({
    where: { status: 'COMPLETED' },
  });
  const completedBookingsToday = await prisma.booking.count({
    where: { 
      status: 'COMPLETED',
      completedAt: { gte: today },
    },
  });

  // Revenue metrics
  const revenueResult = await prisma.booking.aggregate({
    where: {
      status: 'COMPLETED',
      paid: true,
    },
    _sum: { total: true },
  });

  const todayRevenueResult = await prisma.booking.aggregate({
    where: {
      status: 'COMPLETED',
      paid: true,
      completedAt: { gte: today },
    },
    _sum: { total: true },
  });

  const totalRevenue = revenueResult._sum.total || 0;
  const todayRevenue = todayRevenueResult._sum.total || 0;

  // Calculate derived metrics
  const conversionRate = totalBookings > 0 
    ? (completedBookings / totalBookings) * 100 
    : 0;

  const averageOrderValue = completedBookings > 0 
    ? totalRevenue / completedBookings 
    : 0;

  // Customer satisfaction (from reviews)
  const satisfactionResult = await prisma.review.aggregate({
    _avg: { rating: true },
  });

  const customerSatisfaction = satisfactionResult._avg.rating || 0;

  // Market penetration (mock calculation - would need market size data)
  const marketPenetration = Math.min(100, (totalUsers / 100000) * 100); // Assuming 100k total addressable market

  // Growth rates (day-over-day)
  const userGrowthRate = newUsersYesterday > 0 
    ? ((newUsersToday - newUsersYesterday) / newUsersYesterday) * 100 
    : 0;

  const revenueGrowthRate = 0; // Would need yesterday's revenue for calculation

  // Provider utilization
  const providerUtilization = totalProviders > 0 
    ? (activeProviders / totalProviders) * 100 
    : 0;

  return {
    totalUsers,
    newUsers: newUsersToday,
    activeUsers,
    totalProviders,
    newProviders: newProvidersToday,
    activeProviders,
    totalBookings,
    completedBookings: completedBookingsToday,
    totalRevenue,
    averageOrderValue,
    conversionRate,
    customerSatisfaction,
    marketPenetration,
    userRetentionRate: 0, // Would need cohort analysis
    providerUtilization,
    platformGrowthRate: userGrowthRate,
    revenueGrowthRate,
    customerAcquisitionCost: 0, // Would need marketing spend data
    lifetimeValue: 0, // Would need customer lifetime analysis
    churnRate: 0, // Would need retention analysis
  };
}

// Helper function to calculate daily metrics for a specific date
async function calculateDailyMetrics(date: Date) {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
  const startOfPreviousDay = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);

  // User metrics
  const totalUsers = await prisma.user.count({
    where: { createdAt: { lt: endOfDay } },
  });
  const newUsers = await prisma.user.count({
    where: { 
      createdAt: { gte: startOfDay, lt: endOfDay },
    },
  });

  // Active users in the last 30 days from this date
  const thirtyDaysAgo = new Date(startOfDay.getTime() - 30 * 24 * 60 * 60 * 1000);
  const activeUsers = await prisma.user.count({
    where: {
      bookings: {
        some: {
          createdAt: { gte: thirtyDaysAgo, lt: endOfDay },
        },
      },
    },
  });

  // Provider metrics
  const totalProviders = await prisma.provider.count({
    where: { createdAt: { lt: endOfDay } },
  });
  const newProviders = await prisma.provider.count({
    where: { 
      createdAt: { gte: startOfDay, lt: endOfDay },
    },
  });
  const activeProviders = await prisma.provider.count({
    where: {
      bookings: {
        some: {
          createdAt: { gte: thirtyDaysAgo, lt: endOfDay },
        },
      },
    },
  });

  // Booking metrics
  const totalBookings = await prisma.booking.count({
    where: { createdAt: { lt: endOfDay } },
  });
  const completedBookings = await prisma.booking.count({
    where: { 
      status: 'COMPLETED',
      completedAt: { gte: startOfDay, lt: endOfDay },
    },
  });

  // Revenue metrics
  const revenueResult = await prisma.booking.aggregate({
    where: {
      status: 'COMPLETED',
      paid: true,
      completedAt: { lt: endOfDay },
    },
    _sum: { total: true },
  });

  const dailyRevenueResult = await prisma.booking.aggregate({
    where: {
      status: 'COMPLETED',
      paid: true,
      completedAt: { gte: startOfDay, lt: endOfDay },
    },
    _sum: { total: true },
  });

  const totalRevenue = revenueResult._sum.total || 0;
  const dailyRevenue = dailyRevenueResult._sum.total || 0;

  // Calculate derived metrics
  const completedBookingsTotal = await prisma.booking.count({
    where: { 
      status: 'COMPLETED',
      completedAt: { lt: endOfDay },
    },
  });

  const conversionRate = totalBookings > 0 
    ? (completedBookingsTotal / totalBookings) * 100 
    : 0;

  const averageOrderValue = completedBookingsTotal > 0 
    ? totalRevenue / completedBookingsTotal 
    : 0;

  // Customer satisfaction from reviews
  const satisfactionResult = await prisma.review.aggregate({
    where: { createdAt: { lt: endOfDay } },
    _avg: { rating: true },
  });

  const customerSatisfaction = satisfactionResult._avg.rating || 0;

  return {
    totalUsers,
    newUsers,
    activeUsers,
    totalProviders,
    newProviders,
    activeProviders,
    totalBookings,
    completedBookings,
    totalRevenue,
    averageOrderValue,
    conversionRate,
    customerSatisfaction,
    marketPenetration: Math.min(100, (totalUsers / 100000) * 100),
    userRetentionRate: 0, // Complex calculation would be needed
    providerUtilization: totalProviders > 0 ? (activeProviders / totalProviders) * 100 : 0,
    platformGrowthRate: 0, // Would calculate from previous periods
    revenueGrowthRate: 0, // Would calculate from previous periods
    customerAcquisitionCost: 0, // Would need marketing spend data
    lifetimeValue: 0, // Would need customer lifetime analysis
    churnRate: 0, // Would need retention analysis
  };
}

// Helper function to process metrics by granularity
function processMetricsByGranularity(metrics: any[], granularity: string, fromDate: Date) {
  if (granularity === 'daily') {
    return metrics;
  }

  const processedMetrics = new Map();
  const now = new Date();

  if (granularity === 'weekly') {
    metrics.forEach(metric => {
      const weekStart = new Date(metric.date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!processedMetrics.has(weekKey)) {
        processedMetrics.set(weekKey, {
          date: weekStart,
          totalUsers: 0,
          newUsers: 0,
          activeUsers: 0,
          totalProviders: 0,
          newProviders: 0,
          activeProviders: 0,
          totalBookings: 0,
          completedBookings: 0,
          totalRevenue: 0,
          count: 0,
        });
      }

      const weekData = processedMetrics.get(weekKey);
      weekData.totalUsers = Math.max(weekData.totalUsers, metric.totalUsers);
      weekData.newUsers += metric.newUsers;
      weekData.activeUsers = Math.max(weekData.activeUsers, metric.activeUsers);
      weekData.totalProviders = Math.max(weekData.totalProviders, metric.totalProviders);
      weekData.newProviders += metric.newProviders;
      weekData.activeProviders = Math.max(weekData.activeProviders, metric.activeProviders);
      weekData.totalBookings = Math.max(weekData.totalBookings, metric.totalBookings);
      weekData.completedBookings += metric.completedBookings;
      weekData.totalRevenue = Math.max(weekData.totalRevenue, metric.totalRevenue);
      weekData.count++;
    });
  } else if (granularity === 'monthly') {
    metrics.forEach(metric => {
      const monthKey = metric.date.toISOString().substring(0, 7); // YYYY-MM

      if (!processedMetrics.has(monthKey)) {
        processedMetrics.set(monthKey, {
          date: new Date(metric.date.getFullYear(), metric.date.getMonth(), 1),
          totalUsers: 0,
          newUsers: 0,
          activeUsers: 0,
          totalProviders: 0,
          newProviders: 0,
          activeProviders: 0,
          totalBookings: 0,
          completedBookings: 0,
          totalRevenue: 0,
          count: 0,
        });
      }

      const monthData = processedMetrics.get(monthKey);
      monthData.totalUsers = Math.max(monthData.totalUsers, metric.totalUsers);
      monthData.newUsers += metric.newUsers;
      monthData.activeUsers = Math.max(monthData.activeUsers, metric.activeUsers);
      monthData.totalProviders = Math.max(monthData.totalProviders, metric.totalProviders);
      monthData.newProviders += metric.newProviders;
      monthData.activeProviders = Math.max(monthData.activeProviders, metric.activeProviders);
      monthData.totalBookings = Math.max(monthData.totalBookings, metric.totalBookings);
      monthData.completedBookings += metric.completedBookings;
      monthData.totalRevenue = Math.max(monthData.totalRevenue, metric.totalRevenue);
      monthData.count++;
    });
  }

  // Calculate averages for aggregated metrics
  return Array.from(processedMetrics.values()).map(data => ({
    ...data,
    averageOrderValue: data.completedBookings > 0 ? data.totalRevenue / data.completedBookings : 0,
    conversionRate: data.totalBookings > 0 ? (data.completedBookings / data.totalBookings) * 100 : 0,
    providerUtilization: data.totalProviders > 0 ? (data.activeProviders / data.totalProviders) * 100 : 0,
  })).sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Helper function to calculate growth trends
function calculateGrowthTrends(metrics: any[]) {
  if (metrics.length < 2) return null;

  const latest = metrics[metrics.length - 1];
  const previous = metrics[metrics.length - 2];
  const firstPeriod = metrics[0];

  // Period-over-period growth rates
  const periodOverPeriod = {
    users: previous.totalUsers > 0 ? ((latest.totalUsers - previous.totalUsers) / previous.totalUsers) * 100 : 0,
    providers: previous.totalProviders > 0 ? ((latest.totalProviders - previous.totalProviders) / previous.totalProviders) * 100 : 0,
    bookings: previous.totalBookings > 0 ? ((latest.totalBookings - previous.totalBookings) / previous.totalBookings) * 100 : 0,
    revenue: previous.totalRevenue > 0 ? ((latest.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 : 0,
  };

  // Overall growth since start of period
  const overallGrowth = {
    users: firstPeriod.totalUsers > 0 ? ((latest.totalUsers - firstPeriod.totalUsers) / firstPeriod.totalUsers) * 100 : 0,
    providers: firstPeriod.totalProviders > 0 ? ((latest.totalProviders - firstPeriod.totalProviders) / firstPeriod.totalProviders) * 100 : 0,
    bookings: firstPeriod.totalBookings > 0 ? ((latest.totalBookings - firstPeriod.totalBookings) / firstPeriod.totalBookings) * 100 : 0,
    revenue: firstPeriod.totalRevenue > 0 ? ((latest.totalRevenue - firstPeriod.totalRevenue) / firstPeriod.totalRevenue) * 100 : 0,
  };

  // Calculate compound growth rates
  const periods = metrics.length - 1;
  const compoundGrowth = periods > 0 ? {
    users: Math.pow(latest.totalUsers / firstPeriod.totalUsers, 1 / periods) - 1,
    providers: Math.pow(latest.totalProviders / firstPeriod.totalProviders, 1 / periods) - 1,
    bookings: Math.pow(latest.totalBookings / firstPeriod.totalBookings, 1 / periods) - 1,
    revenue: Math.pow(latest.totalRevenue / firstPeriod.totalRevenue, 1 / periods) - 1,
  } : null;

  return {
    periodOverPeriod,
    overallGrowth,
    compoundGrowth: compoundGrowth ? {
      users: compoundGrowth.users * 100,
      providers: compoundGrowth.providers * 100,
      bookings: compoundGrowth.bookings * 100,
      revenue: compoundGrowth.revenue * 100,
    } : null,
  };
}

// Helper function to get market segmentation data
async function getMarketSegmentation(fromDate: Date) {
  // Service category breakdown
  const categoryBookings = await prisma.booking.groupBy({
    by: ['serviceId'],
    where: {
      createdAt: { gte: fromDate },
      status: 'COMPLETED',
    },
    _count: { serviceId: true },
    _sum: { total: true },
  });

  // Get service details for categories
  const serviceIds = categoryBookings.map(cb => cb.serviceId);
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, category: true, name: true },
  });

  const categoryMap = new Map();
  categoryBookings.forEach(booking => {
    const service = services.find(s => s.id === booking.serviceId);
    if (service) {
      const category = service.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { bookings: 0, revenue: 0 });
      }
      const catData = categoryMap.get(category);
      catData.bookings += booking._count.serviceId;
      catData.revenue += booking._sum.total || 0;
    }
  });

  const categorySegmentation = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    ...data,
    averageOrderValue: data.bookings > 0 ? data.revenue / data.bookings : 0,
  }));

  // User acquisition channels (mock data - would need actual tracking)
  const acquisitionChannels = [
    { channel: 'Organic Search', users: 45, percentage: 35 },
    { channel: 'Social Media', users: 32, percentage: 25 },
    { channel: 'Referrals', users: 26, percentage: 20 },
    { channel: 'Direct', users: 19, percentage: 15 },
    { channel: 'Paid Ads', users: 6, percentage: 5 },
  ];

  return {
    serviceCategories: categorySegmentation,
    acquisitionChannels,
  };
}

// Helper function to generate growth forecasting
async function generateGrowthForecasting(metrics: any[]) {
  if (metrics.length < 5) return null; // Need sufficient data for forecasting

  // Simple linear regression for trend forecasting
  const forecastPeriods = 4; // Forecast next 4 periods
  const forecasts = [];

  // Calculate trends for key metrics
  const userTrend = calculateLinearTrend(metrics.map((m, i) => ({ x: i, y: m.totalUsers })));
  const revenueTrend = calculateLinearTrend(metrics.map((m, i) => ({ x: i, y: m.totalRevenue })));
  const bookingTrend = calculateLinearTrend(metrics.map((m, i) => ({ x: i, y: m.totalBookings })));

  for (let i = 1; i <= forecastPeriods; i++) {
    const nextIndex = metrics.length + i - 1;
    const lastMetric = metrics[metrics.length - 1];
    const nextDate = new Date(lastMetric.date);
    nextDate.setMonth(nextDate.getMonth() + i); // Assuming monthly forecasting

    forecasts.push({
      date: nextDate,
      totalUsers: Math.round(userTrend.slope * nextIndex + userTrend.intercept),
      totalRevenue: Math.round(revenueTrend.slope * nextIndex + revenueTrend.intercept),
      totalBookings: Math.round(bookingTrend.slope * nextIndex + bookingTrend.intercept),
      confidence: Math.max(50, 90 - (i * 10)), // Decreasing confidence
    });
  }

  return {
    forecasts,
    trends: {
      userGrowthTrend: userTrend.slope > 0 ? 'Growing' : 'Declining',
      revenueGrowthTrend: revenueTrend.slope > 0 ? 'Growing' : 'Declining',
      bookingGrowthTrend: bookingTrend.slope > 0 ? 'Growing' : 'Declining',
    },
    reliability: metrics.length >= 12 ? 'High' : metrics.length >= 6 ? 'Medium' : 'Low',
  };
}

// Helper function to calculate linear trend
function calculateLinearTrend(data: { x: number; y: number }[]) {
  const n = data.length;
  const sumX = data.reduce((sum, point) => sum + point.x, 0);
  const sumY = data.reduce((sum, point) => sum + point.y, 0);
  const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

// Helper function to calculate KPIs
function calculateKeyPerformanceIndicators(historicalMetrics: any[], currentMetrics: any) {
  const latest = historicalMetrics[historicalMetrics.length - 1] || currentMetrics;
  const previous = historicalMetrics.length > 1 ? historicalMetrics[historicalMetrics.length - 2] : null;

  return {
    monthlyActiveUsers: latest.activeUsers,
    monthlyRecurringRevenue: latest.totalRevenue, // This would be calculated differently for subscription model
    customerAcquisitionCost: 0, // Would need marketing spend data
    lifetimeValue: 0, // Would need customer lifetime analysis
    churnRate: 0, // Would need retention analysis
    netPromoterScore: 0, // Would need survey data
    marketShare: latest.marketPenetration,
    providerSatisfaction: 0, // Would need provider survey data
    averageTimeToService: 0, // Would need service completion time data
    platformReliability: 99.9, // Would be calculated from uptime data
  };
}

// Helper function to update marketplace insights
async function updateMarketplaceInsights(startDate: Date, endDate: Date) {
  // This would calculate and update MarketplaceInsights table
  // Implementation would analyze booking patterns, service demand, pricing trends, etc.
  console.log('Updating marketplace insights for period:', startDate, 'to', endDate);
}