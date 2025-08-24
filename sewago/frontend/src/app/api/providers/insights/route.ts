import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const insightsQuerySchema = z.object({
  providerId: z.string(),
  includeRecommendations: z.boolean().default(true),
  includeCompetitorAnalysis: z.boolean().default(false),
});

// GET /api/providers/insights - Get business insights for provider
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const providerId = url.searchParams.get('providerId');
    const includeRecommendations = url.searchParams.get('includeRecommendations') !== 'false';
    const includeCompetitorAnalysis = url.searchParams.get('includeCompetitorAnalysis') === 'true';

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Get existing insights or create new ones
    let insights = await prisma.providerBusinessInsights.findUnique({
      where: { providerId },
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

    if (!insights) {
      // Generate new insights
      const generatedInsights = await generateBusinessInsights(providerId);
      insights = await prisma.providerBusinessInsights.create({
        data: {
          providerId,
          ...generatedInsights,
        },
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
    }

    // Get competitive analysis if requested
    let competitorData = null;
    if (includeCompetitorAnalysis) {
      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        select: { zones: true, skills: true },
      });

      if (provider) {
        competitorData = await getCompetitorAnalysis(provider.zones, provider.skills);
      }
    }

    // Get additional analytics data
    const analytics = await prisma.providerAnalytics.findUnique({
      where: { providerId },
    });

    // Get performance benchmarks
    const benchmarks = await getPerformanceBenchmarks(providerId);

    return NextResponse.json({
      insights,
      analytics,
      benchmarks,
      competitor: competitorData,
      recommendations: includeRecommendations ? insights.recommendations : null,
    });
  } catch (error) {
    console.error('Provider insights error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider insights' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/providers/insights - Regenerate insights
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, forceRegenerate } = body;

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Check if recent insights exist (less than 7 days old)
    const existingInsights = await prisma.providerBusinessInsights.findUnique({
      where: { providerId },
    });

    const shouldRegenerate = forceRegenerate || 
      !existingInsights || 
      (Date.now() - existingInsights.lastAnalyzed.getTime()) > 7 * 24 * 60 * 60 * 1000;

    if (!shouldRegenerate) {
      return NextResponse.json({
        message: 'Insights are up to date',
        insights: existingInsights,
      });
    }

    // Generate new insights
    const generatedInsights = await generateBusinessInsights(providerId);

    // Upsert insights
    const updatedInsights = await prisma.providerBusinessInsights.upsert({
      where: { providerId },
      update: {
        ...generatedInsights,
        lastAnalyzed: new Date(),
      },
      create: {
        providerId,
        ...generatedInsights,
        lastAnalyzed: new Date(),
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

    return NextResponse.json({
      message: 'Insights updated successfully',
      insights: updatedInsights,
    });
  } catch (error) {
    console.error('Regenerate insights error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate insights' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to generate business insights
async function generateBusinessInsights(providerId: string) {
  // Get provider data
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: {
      bookings: {
        include: {
          review: true,
          service: true,
        }
      }
    }
  });

  if (!provider) {
    throw new Error('Provider not found');
  }

  // Get analytics data
  const analytics = await prisma.providerAnalytics.findUnique({
    where: { providerId },
  });

  // Analyze strengths
  const strengths = [];
  if (analytics?.averageRating > 4.5) strengths.push('Excellent customer satisfaction');
  if (analytics?.completionRate > 90) strengths.push('High service completion rate');
  if (analytics?.customerRetention > 60) strengths.push('Strong customer loyalty');
  if (analytics?.growthRate > 20) strengths.push('Rapid business growth');
  if (provider.yearsActive >= 3) strengths.push('Experienced service provider');

  // Analyze opportunities
  const opportunities = [];
  if (provider.zones.length === 1) opportunities.push('Expand to additional service areas');
  if (provider.skills.length <= 2) opportunities.push('Add complementary services');
  if (analytics?.customerRetention < 40) opportunities.push('Implement customer retention strategies');
  if (analytics?.responseTime > 60) opportunities.push('Improve response time to customers');

  // Analyze threats
  const threats = [];
  if (analytics?.growthRate < 0) threats.push('Declining business performance');
  if (analytics?.averageRating < 4.0) threats.push('Customer satisfaction concerns');
  if (analytics?.marketShare < 5) threats.push('Low market presence');

  // Generate recommendations
  const recommendations = generateRecommendations(provider, analytics);

  // Analyze market position
  let marketPosition = 'Emerging';
  if (analytics?.totalRevenue > 500000 && analytics?.averageRating > 4.0) {
    marketPosition = 'Established';
  }
  if (analytics?.marketShare > 10 && analytics?.customerRetention > 70) {
    marketPosition = 'Market Leader';
  }

  // Customer segmentation analysis
  const customerSegments = analyzeCustomerSegments(provider.bookings);

  // Pricing strategy insights
  const pricingStrategy = analyzePricingStrategy(provider.bookings);

  // Service gap analysis
  const serviceGaps = identifyServiceGaps(provider.skills, provider.zones);

  // Competitive advantages
  const competitiveAdvantage = identifyCompetitiveAdvantages(provider, analytics);

  // Risk factors
  const riskFactors = identifyRiskFactors(provider, analytics);

  // Growth potential score (0-1)
  const growthPotential = calculateGrowthPotential(provider, analytics);

  return {
    strengths,
    opportunities,
    threats,
    recommendations,
    marketPosition,
    customerSegments,
    pricingStrategy,
    serviceGaps,
    competitiveAdvantage,
    riskFactors,
    growthPotential,
  };
}

function generateRecommendations(provider: any, analytics: any) {
  const recommendations = [];

  if (analytics?.averageRating < 4.0) {
    recommendations.push({
      type: 'quality_improvement',
      priority: 'high',
      title: 'Improve Service Quality',
      description: 'Focus on addressing customer feedback to improve ratings',
      impact: 'High customer satisfaction leads to more bookings and referrals',
      actionItems: [
        'Review recent negative feedback',
        'Implement quality control processes',
        'Provide additional training if needed',
      ]
    });
  }

  if (analytics?.responseTime > 60) {
    recommendations.push({
      type: 'operational_efficiency',
      priority: 'medium',
      title: 'Reduce Response Time',
      description: 'Faster responses lead to higher booking conversion rates',
      impact: 'Can increase booking conversion by 15-25%',
      actionItems: [
        'Set up mobile notifications for new requests',
        'Use quick response templates',
        'Optimize your daily schedule',
      ]
    });
  }

  if (provider.zones.length === 1) {
    recommendations.push({
      type: 'expansion',
      priority: 'medium',
      title: 'Geographic Expansion',
      description: 'Expand to nearby areas to increase market reach',
      impact: 'Can increase revenue by 30-50%',
      actionItems: [
        'Research nearby high-demand areas',
        'Test expansion with limited availability',
        'Adjust pricing for new areas',
      ]
    });
  }

  if (analytics?.customerRetention < 40) {
    recommendations.push({
      type: 'retention',
      priority: 'high',
      title: 'Customer Retention Program',
      description: 'Implement strategies to retain existing customers',
      impact: 'Repeat customers are 50% more profitable',
      actionItems: [
        'Follow up after service completion',
        'Offer loyalty discounts',
        'Send seasonal reminders for services',
      ]
    });
  }

  return recommendations;
}

function analyzeCustomerSegments(bookings: any[]) {
  // Analyze booking patterns to identify customer segments
  const segments = [];

  // High-value customers (top 20% by spending)
  const customerSpending = new Map();
  bookings.forEach(booking => {
    if (booking.status === 'COMPLETED') {
      const current = customerSpending.get(booking.userId) || 0;
      customerSpending.set(booking.userId, current + booking.total);
    }
  });

  const spendingValues = Array.from(customerSpending.values()).sort((a, b) => b - a);
  const highValueThreshold = spendingValues[Math.floor(spendingValues.length * 0.2)] || 0;

  segments.push({
    name: 'High-Value Customers',
    size: Math.floor(spendingValues.length * 0.2),
    characteristics: 'Customers spending above NPR ' + (highValueThreshold / 100).toFixed(0),
    value: 'Generate 60-80% of total revenue',
    strategy: 'Provide premium service and exclusive offers',
  });

  // Regular customers (repeat bookings)
  const customerBookingCount = new Map();
  bookings.forEach(booking => {
    const current = customerBookingCount.get(booking.userId) || 0;
    customerBookingCount.set(booking.userId, current + 1);
  });

  const regularCustomers = Array.from(customerBookingCount.values()).filter(count => count >= 3).length;
  
  segments.push({
    name: 'Regular Customers',
    size: regularCustomers,
    characteristics: 'Customers with 3+ bookings',
    value: 'Provide stable revenue base',
    strategy: 'Focus on retention and upselling',
  });

  return segments;
}

function analyzePricingStrategy(bookings: any[]) {
  if (bookings.length === 0) return {};

  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const revenues = completedBookings.map(b => b.total);
  
  if (revenues.length === 0) return {};

  revenues.sort((a, b) => a - b);
  const median = revenues[Math.floor(revenues.length / 2)];
  const average = revenues.reduce((sum, r) => sum + r, 0) / revenues.length;

  return {
    averageOrderValue: average,
    medianOrderValue: median,
    priceRange: {
      min: Math.min(...revenues),
      max: Math.max(...revenues),
    },
    recommendation: average > median ? 'Consider more competitive pricing' : 'Good pricing distribution',
  };
}

function identifyServiceGaps(skills: string[], zones: string[]) {
  // Common service combinations that are often requested together
  const serviceGaps = [];

  if (skills.includes('cleaning') && !skills.includes('gardening')) {
    serviceGaps.push({
      service: 'Garden Cleaning',
      opportunity: 'Many cleaning customers also need garden services',
      potential: 'Medium',
    });
  }

  if (skills.includes('electrical') && !skills.includes('plumbing')) {
    serviceGaps.push({
      service: 'Basic Plumbing',
      opportunity: 'Electrical customers often need minor plumbing work',
      potential: 'High',
    });
  }

  if (skills.length <= 2) {
    serviceGaps.push({
      service: 'Handyman Services',
      opportunity: 'Expand to general maintenance and repairs',
      potential: 'High',
    });
  }

  return serviceGaps;
}

function identifyCompetitiveAdvantages(provider: any, analytics: any) {
  const advantages = [];

  if (provider.yearsActive >= 5) advantages.push('Extensive experience');
  if (analytics?.averageRating > 4.5) advantages.push('Exceptional customer satisfaction');
  if (analytics?.completionRate > 95) advantages.push('Reliable service delivery');
  if (provider.skills.length >= 4) advantages.push('Diverse skill set');
  if (analytics?.responseTime < 15) advantages.push('Quick response time');

  return advantages;
}

function identifyRiskFactors(provider: any, analytics: any) {
  const risks = [];

  if (analytics?.growthRate < -10) {
    risks.push({
      type: 'Performance Risk',
      description: 'Declining business growth',
      severity: 'High',
      mitigation: 'Analyze market trends and adjust strategy',
    });
  }

  if (analytics?.averageRating < 3.5) {
    risks.push({
      type: 'Reputation Risk',
      description: 'Low customer satisfaction ratings',
      severity: 'High',
      mitigation: 'Immediate quality improvement initiatives',
    });
  }

  if (provider.zones.length === 1 && provider.skills.length <= 2) {
    risks.push({
      type: 'Market Risk',
      description: 'Limited service offering and area coverage',
      severity: 'Medium',
      mitigation: 'Diversify services or expand coverage area',
    });
  }

  return risks;
}

function calculateGrowthPotential(provider: any, analytics: any) {
  let score = 0.5; // Base score

  // Positive factors
  if (analytics?.averageRating > 4.0) score += 0.1;
  if (analytics?.growthRate > 10) score += 0.15;
  if (analytics?.customerRetention > 50) score += 0.1;
  if (provider.skills.length >= 3) score += 0.05;
  if (provider.zones.length >= 2) score += 0.05;

  // Negative factors
  if (analytics?.growthRate < 0) score -= 0.2;
  if (analytics?.averageRating < 3.5) score -= 0.15;
  if (analytics?.customerRetention < 30) score -= 0.1;

  return Math.max(0, Math.min(1, score));
}

async function getCompetitorAnalysis(zones: string[], skills: string[]) {
  // Get competitor data for same zones and skills
  const competitors = await prisma.competitorAnalysis.findMany({
    where: {
      OR: [
        { region: { in: zones } },
        { category: { in: skills } },
      ]
    },
    orderBy: { marketShare: 'desc' },
    take: 5,
  });

  return competitors;
}

async function getPerformanceBenchmarks(providerId: string) {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { skills: true, zones: true },
  });

  if (!provider) return [];

  const benchmarks = await prisma.performanceBenchmark.findMany({
    where: {
      OR: [
        { category: { in: provider.skills } },
        { region: { in: provider.zones } },
      ],
      providerId: null, // Industry benchmarks only
    },
    orderBy: { lastCalculated: 'desc' },
  });

  return benchmarks;
}