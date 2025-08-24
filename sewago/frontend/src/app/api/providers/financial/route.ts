import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const financialDataSchema = z.object({
  expenses: z.array(z.object({
    category: z.string(),
    amount: z.number().positive(),
    description: z.string().optional(),
    date: z.string().transform(str => new Date(str)),
  })).optional(),
  financialGoals: z.object({
    monthlyTarget: z.number().positive().optional(),
    yearlyTarget: z.number().positive().optional(),
    savingsGoal: z.number().positive().optional(),
  }).optional(),
  paymentMethods: z.array(z.string()).optional(),
  taxInfo: z.object({
    panNumber: z.string().optional(),
    registrationType: z.enum(['INDIVIDUAL', 'BUSINESS']).optional(),
    taxYear: z.number().optional(),
  }).optional(),
});

// GET /api/providers/financial - Get provider financial dashboard
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const providerId = url.searchParams.get('providerId');
    const timeframe = url.searchParams.get('timeframe') || '1m';
    const includeProjections = url.searchParams.get('includeProjections') !== 'false';

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Get or create financial data
    let financials = await prisma.providerFinancials.findUnique({
      where: { providerId },
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

    if (!financials) {
      // Calculate and create initial financial data
      const calculatedFinancials = await calculateProviderFinancials(providerId);
      financials = await prisma.providerFinancials.create({
        data: {
          providerId,
          ...calculatedFinancials,
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
    }

    // Get detailed financial metrics for the timeframe
    const detailedMetrics = await getDetailedFinancialMetrics(providerId, timeframe);

    // Get income projections if requested
    let projections = null;
    if (includeProjections) {
      projections = await generateIncomeProjections(providerId);
    }

    // Calculate tax information
    const taxInfo = calculateTaxInfo(financials, detailedMetrics);

    // Get performance comparison with industry benchmarks
    const benchmarks = await getFinancialBenchmarks(providerId);

    return NextResponse.json({
      financials,
      detailedMetrics,
      projections,
      taxInfo,
      benchmarks,
      timeframe,
    });
  } catch (error) {
    console.error('Provider financial data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/providers/financial - Update financial data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, ...updateData } = body;

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Validate input data
    const validatedData = financialDataSchema.parse(updateData);

    // Get current financial data
    const currentFinancials = await prisma.providerFinancials.findUnique({
      where: { providerId },
    });

    // Merge new data with existing data
    const updatedFinancials = await prisma.providerFinancials.upsert({
      where: { providerId },
      update: {
        ...validatedData,
        lastUpdated: new Date(),
      },
      create: {
        providerId,
        ...validatedData,
        lastUpdated: new Date(),
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

    // Recalculate earnings and metrics
    const recalculatedData = await calculateProviderFinancials(providerId);
    
    // Update with recalculated data
    const finalFinancials = await prisma.providerFinancials.update({
      where: { providerId },
      data: {
        ...recalculatedData,
        // Keep user-provided data
        ...validatedData,
        lastUpdated: new Date(),
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

    return NextResponse.json(finalFinancials);
  } catch (error) {
    console.error('Update financial data error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update financial data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to calculate provider financials
async function calculateProviderFinancials(providerId: string) {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  
  // Get all completed bookings
  const completedBookings = await prisma.booking.findMany({
    where: {
      providerId,
      status: 'COMPLETED',
      paid: true,
    },
    select: {
      total: true,
      createdAt: true,
      completedAt: true,
    },
    orderBy: { completedAt: 'asc' },
  });

  // Calculate total earnings
  const totalEarnings = completedBookings.reduce((sum, booking) => sum + booking.total, 0);

  // Calculate monthly earnings (last 12 months)
  const monthlyEarnings = [];
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthlyBookings = completedBookings.filter(booking => 
      booking.completedAt && 
      booking.completedAt >= monthStart && 
      booking.completedAt <= monthEnd
    );
    
    const monthlyTotal = monthlyBookings.reduce((sum, booking) => sum + booking.total, 0);
    
    monthlyEarnings.push({
      month: monthStart.toISOString().substring(0, 7), // YYYY-MM format
      earnings: monthlyTotal,
      bookingCount: monthlyBookings.length,
      averageOrderValue: monthlyBookings.length > 0 ? monthlyTotal / monthlyBookings.length : 0,
    });
  }

  // Calculate platform fees (assuming 15% commission)
  const platformFeeRate = 0.15;
  const platformFees = Math.floor(totalEarnings * platformFeeRate);

  // Net earnings after platform fees
  const netEarnings = totalEarnings - platformFees;

  // Calculate profit margin (assuming some operational costs)
  const operationalCostRate = 0.10; // 10% for operational costs
  const operationalCosts = Math.floor(netEarnings * operationalCostRate);
  const profitMargin = netEarnings > 0 ? ((netEarnings - operationalCosts) / netEarnings) * 100 : 0;

  // Outstanding payments (mock data - would be based on payment processing)
  const outstandingPayments = Math.floor(totalEarnings * 0.05); // 5% pending

  return {
    totalEarnings,
    monthlyEarnings,
    outstandingPayments,
    platformFees,
    profitMargin,
    paymentMethods: ['Bank Transfer', 'eSewa', 'Khalti'],
  };
}

// Helper function to get detailed financial metrics
async function getDetailedFinancialMetrics(providerId: string, timeframe: string) {
  const now = new Date();
  const timeRanges = {
    '1w': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    '1m': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    '3m': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    '6m': new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
    '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
  };

  const fromDate = timeRanges[timeframe as keyof typeof timeRanges] || timeRanges['1m'];

  // Get bookings in timeframe
  const bookings = await prisma.booking.findMany({
    where: {
      providerId,
      createdAt: { gte: fromDate },
      status: 'COMPLETED',
      paid: true,
    },
    include: {
      service: {
        select: { category: true, name: true }
      }
    },
  });

  // Calculate metrics by service category
  const categoryMetrics = new Map();
  bookings.forEach(booking => {
    const category = booking.service.category;
    if (!categoryMetrics.has(category)) {
      categoryMetrics.set(category, {
        category,
        bookingCount: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
      });
    }
    
    const metrics = categoryMetrics.get(category);
    metrics.bookingCount++;
    metrics.totalRevenue += booking.total;
    metrics.averageOrderValue = metrics.totalRevenue / metrics.bookingCount;
  });

  // Daily revenue trend
  const dailyRevenue = new Map();
  const daysDiff = Math.ceil((now.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < daysDiff; i++) {
    const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    dailyRevenue.set(dateStr, { date: dateStr, revenue: 0, bookings: 0 });
  }

  bookings.forEach(booking => {
    const dateStr = booking.createdAt.toISOString().split('T')[0];
    if (dailyRevenue.has(dateStr)) {
      const dayData = dailyRevenue.get(dateStr);
      dayData.revenue += booking.total;
      dayData.bookings++;
    }
  });

  return {
    summary: {
      totalRevenue: bookings.reduce((sum, b) => sum + b.total, 0),
      totalBookings: bookings.length,
      averageOrderValue: bookings.length > 0 
        ? bookings.reduce((sum, b) => sum + b.total, 0) / bookings.length 
        : 0,
    },
    categoryBreakdown: Array.from(categoryMetrics.values()),
    dailyTrend: Array.from(dailyRevenue.values()).sort((a, b) => a.date.localeCompare(b.date)),
  };
}

// Helper function to generate income projections
async function generateIncomeProjections(providerId: string) {
  // Get historical data for the last 6 months
  const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
  
  const historicalBookings = await prisma.booking.findMany({
    where: {
      providerId,
      createdAt: { gte: sixMonthsAgo },
      status: 'COMPLETED',
      paid: true,
    },
    select: {
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (historicalBookings.length === 0) {
    return {
      nextMonth: 0,
      nextQuarter: 0,
      nextSixMonths: 0,
      confidence: 'low',
      factors: ['Insufficient historical data'],
    };
  }

  // Calculate monthly averages
  const monthlyTotals = new Map();
  historicalBookings.forEach(booking => {
    const monthKey = booking.createdAt.toISOString().substring(0, 7);
    monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + booking.total);
  });

  const monthlyValues = Array.from(monthlyTotals.values());
  const averageMonthlyRevenue = monthlyValues.reduce((sum, val) => sum + val, 0) / monthlyValues.length;

  // Calculate growth trend
  let growthTrend = 0;
  if (monthlyValues.length >= 2) {
    const recentMonths = monthlyValues.slice(-3); // Last 3 months
    const earlierMonths = monthlyValues.slice(0, 3); // First 3 months
    
    const recentAvg = recentMonths.reduce((sum, val) => sum + val, 0) / recentMonths.length;
    const earlierAvg = earlierMonths.reduce((sum, val) => sum + val, 0) / earlierMonths.length;
    
    growthTrend = earlierAvg > 0 ? (recentAvg - earlierAvg) / earlierAvg : 0;
  }

  // Apply growth trend to projections
  const nextMonth = Math.max(0, averageMonthlyRevenue * (1 + growthTrend));
  const nextQuarter = Math.max(0, nextMonth * 3 * (1 + growthTrend * 0.5)); // Conservative quarterly growth
  const nextSixMonths = Math.max(0, nextMonth * 6 * (1 + growthTrend * 0.3)); // More conservative long-term

  // Determine confidence level
  let confidence = 'medium';
  if (monthlyValues.length < 3) confidence = 'low';
  else if (monthlyValues.length >= 6 && Math.abs(growthTrend) < 0.2) confidence = 'high';

  // Identify factors affecting projections
  const factors = [];
  if (growthTrend > 0.1) factors.push('Growing business trend');
  if (growthTrend < -0.1) factors.push('Declining business trend');
  if (monthlyValues.length >= 6) factors.push('Sufficient historical data');
  factors.push('Seasonal variations may apply');

  return {
    nextMonth: Math.round(nextMonth),
    nextQuarter: Math.round(nextQuarter),
    nextSixMonths: Math.round(nextSixMonths),
    confidence,
    factors,
    growthTrend: Math.round(growthTrend * 100), // Convert to percentage
  };
}

// Helper function to calculate tax information
function calculateTaxInfo(financials: any, detailedMetrics: any) {
  const annualIncome = financials.totalEarnings;
  
  // Nepal tax brackets for individual taxpayers (FY 2023/24)
  let taxableIncome = Math.max(0, annualIncome - 40000000); // 4 lakh exemption in paisa
  let incomeTax = 0;

  // Tax calculation based on Nepal's progressive tax system
  if (taxableIncome > 0) {
    // First 1 lakh: 1%
    const firstSlab = Math.min(taxableIncome, 10000000);
    incomeTax += firstSlab * 0.01;
    taxableIncome -= firstSlab;

    // Next 2 lakh: 10%
    if (taxableIncome > 0) {
      const secondSlab = Math.min(taxableIncome, 20000000);
      incomeTax += secondSlab * 0.10;
      taxableIncome -= secondSlab;
    }

    // Next 2 lakh: 20%
    if (taxableIncome > 0) {
      const thirdSlab = Math.min(taxableIncome, 20000000);
      incomeTax += thirdSlab * 0.20;
      taxableIncome -= thirdSlab;
    }

    // Next 1 lakh: 30%
    if (taxableIncome > 0) {
      const fourthSlab = Math.min(taxableIncome, 10000000);
      incomeTax += fourthSlab * 0.30;
      taxableIncome -= fourthSlab;
    }

    // Above 10 lakh: 36%
    if (taxableIncome > 0) {
      incomeTax += taxableIncome * 0.36;
    }
  }

  return {
    annualIncome,
    taxableIncome: Math.max(0, annualIncome - 40000000),
    estimatedIncomeTax: Math.round(incomeTax),
    effectiveTaxRate: annualIncome > 0 ? (incomeTax / annualIncome) * 100 : 0,
    taxBracket: getTaxBracket(annualIncome),
    deductions: {
      standardDeduction: 40000000, // 4 lakh in paisa
      businessExpenses: financials.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0,
    },
    recommendations: generateTaxRecommendations(annualIncome, incomeTax),
  };
}

function getTaxBracket(income: number) {
  if (income <= 40000000) return '0% (Below exemption limit)';
  if (income <= 50000000) return '1% (Up to 5 lakh)';
  if (income <= 70000000) return '10% (5-7 lakh)';
  if (income <= 90000000) return '20% (7-9 lakh)';
  if (income <= 100000000) return '30% (9-10 lakh)';
  return '36% (Above 10 lakh)';
}

function generateTaxRecommendations(income: number, tax: number) {
  const recommendations = [];

  if (income > 40000000) {
    recommendations.push('Consider maintaining proper business expense records for tax deductions');
  }

  if (tax > 0) {
    recommendations.push('Set aside monthly funds for tax payments to avoid year-end burden');
  }

  if (income > 100000000) {
    recommendations.push('Consider consulting a tax advisor for advanced tax planning');
    recommendations.push('Explore investment options that provide tax benefits');
  }

  recommendations.push('File advance tax payments quarterly to avoid penalties');
  recommendations.push('Keep digital receipts for all business-related expenses');

  return recommendations;
}

async function getFinancialBenchmarks(providerId: string) {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { skills: true, zones: true, tier: true },
  });

  if (!provider) return [];

  // Mock benchmark data - in a real system, this would come from aggregated provider data
  const benchmarks = [
    {
      metric: 'Monthly Revenue',
      providerValue: 0, // This would be calculated from actual data
      industryAverage: 2500000, // 25,000 NPR in paisa
      topPerformers: 5000000, // 50,000 NPR in paisa
      percentile: 65,
    },
    {
      metric: 'Profit Margin',
      providerValue: 0,
      industryAverage: 35, // 35%
      topPerformers: 50, // 50%
      percentile: 70,
    },
    {
      metric: 'Average Order Value',
      providerValue: 0,
      industryAverage: 150000, // 1,500 NPR in paisa
      topPerformers: 250000, // 2,500 NPR in paisa
      percentile: 55,
    },
  ];

  return benchmarks;
}