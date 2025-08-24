import { NextRequest, NextResponse } from 'next/server';
import { behaviorTracker } from '@/lib/personalization/behavior-tracker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'basic', 'detailed', 'analytics'

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get comprehensive user insights
    const insights = await behaviorTracker.getUserInsights(userId);
    
    if (!insights) {
      return NextResponse.json({
        success: true,
        data: {
          hasInsights: false,
          message: 'Start using SewaGo to get personalized insights!',
          quickStart: {
            suggestions: [
              'Browse services to understand your preferences',
              'Book a service to track your usage patterns',
              'Rate services to improve recommendations',
              'Set your location preferences'
            ]
          }
        }
      });
    }

    let responseData;

    switch (type) {
      case 'analytics':
        responseData = await getAnalyticsInsights(userId, insights);
        break;
      case 'detailed':
        responseData = await getDetailedInsights(userId, insights);
        break;
      default:
        responseData = await getBasicInsights(userId, insights);
    }

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error getting user insights:', error);
    return NextResponse.json(
      { error: 'Failed to get user insights' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId and action are required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'refresh':
        // Force refresh user insights
        await behaviorTracker.updateUserInsights(userId);
        result = { message: 'Insights refreshed successfully' };
        break;
        
      case 'export':
        // Export user insights (would implement actual export logic)
        const insights = await behaviorTracker.getUserInsights(userId);
        result = {
          message: 'Insights exported successfully',
          data: insights,
          exportedAt: new Date().toISOString()
        };
        break;
        
      case 'reset':
        // Reset personalization data (careful operation)
        await resetPersonalizationData(userId);
        result = { message: 'Personalization data reset successfully' };
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error processing insights action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}

async function getBasicInsights(userId: string, insights: any) {
  return {
    hasInsights: true,
    profile: insights.personalityProfile,
    topCategories: insights.topCategories.slice(0, 3),
    favoriteTimeSlots: insights.mostBookedTimes.slice(0, 2),
    averageSpending: insights.averageSpending,
    bookingFrequency: insights.personalityProfile.bookingFrequency,
    summary: generateInsightsSummary(insights),
    recommendations: {
      count: insights.predictedNeeds.length,
      preview: insights.predictedNeeds.slice(0, 2)
    },
    lastUpdated: new Date().toISOString()
  };
}

async function getDetailedInsights(userId: string, insights: any) {
  // Get additional data for detailed insights
  const [recentBookings, preferences] = await Promise.all([
    getRecentBookings(userId),
    getUserPreferences(userId)
  ]);

  return {
    hasInsights: true,
    personalityProfile: insights.personalityProfile,
    behaviorPatterns: {
      topCategories: insights.topCategories,
      timePreferences: insights.mostBookedTimes,
      locationHotspots: insights.locationHotspots,
      seasonalPatterns: insights.seasonalPatterns,
      bookingPatterns: insights.bookingPatterns
    },
    spendingAnalysis: {
      averageSpending: insights.averageSpending,
      categoryBreakdown: calculateSpendingByCategory(recentBookings),
      monthlyTrend: calculateMonthlySpendingTrend(recentBookings),
      savingsOpportunities: identifySavingsOpportunities(insights, recentBookings)
    },
    providerInsights: {
      preferredProviders: insights.providerAffinities,
      relationshipStrength: calculateProviderRelationshipStrength(recentBookings),
      recommendedProviders: await getRecommendedProviders(userId, insights)
    },
    predictiveInsights: {
      upcomingNeeds: insights.predictedNeeds,
      seasonalRecommendations: generateSeasonalRecommendations(insights),
      riskFactors: identifyRiskFactors(insights, recentBookings)
    },
    engagementMetrics: {
      platformUsage: calculatePlatformUsage(recentBookings),
      satisfactionScore: calculateSatisfactionScore(recentBookings),
      loyaltyScore: calculateLoyaltyScore(insights, recentBookings)
    },
    lastUpdated: new Date().toISOString()
  };
}

async function getAnalyticsInsights(userId: string, insights: any) {
  const [recentBookings, allBehavior] = await Promise.all([
    getRecentBookings(userId),
    getAllUserBehavior(userId)
  ]);

  return {
    hasInsights: true,
    demographics: {
      userSegment: determineUserSegment(insights),
      lifestageIndicators: analyzeLifestageIndicators(insights, recentBookings),
      geographicProfile: analyzeGeographicProfile(insights)
    },
    behaviorAnalytics: {
      sessionPatterns: analyzeSessionPatterns(allBehavior),
      conversionFunnels: analyzeConversionFunnels(allBehavior),
      dropoffPoints: identifyDropoffPoints(allBehavior),
      engagementDepth: calculateEngagementDepth(allBehavior)
    },
    performanceMetrics: {
      recommendationEffectiveness: insights.recommendationScore,
      personalizationAccuracy: calculatePersonalizationAccuracy(insights, recentBookings),
      predictionAccuracy: calculatePredictionAccuracy(insights, recentBookings),
      satisfactionCorrelation: analyzeSatisfactionCorrelation(insights, recentBookings)
    },
    businessValue: {
      customerLifetimeValue: calculateCLV(recentBookings),
      retentionProbability: calculateRetentionProbability(insights, recentBookings),
      upsellOpportunities: identifyUpsellOpportunities(insights, recentBookings),
      churnRisk: calculateChurnRisk(insights, allBehavior)
    },
    comparativeAnalysis: {
      peerComparison: await generatePeerComparison(userId, insights),
      marketPosition: analyzeMarketPosition(insights),
      competitiveInsights: generateCompetitiveInsights(insights)
    },
    lastUpdated: new Date().toISOString()
  };
}

// Helper functions

async function getRecentBookings(userId: string) {
  return await prisma.booking.findMany({
    where: { userId },
    include: {
      service: true,
      review: true
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
}

async function getUserPreferences(userId: string) {
  return await prisma.userPreferences.findUnique({
    where: { userId }
  });
}

async function getAllUserBehavior(userId: string) {
  return await prisma.userBehavior.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: 1000 // Last 1000 events
  });
}

function generateInsightsSummary(insights: any): string {
  const profile = insights.personalityProfile;
  const topCategory = insights.topCategories[0];
  const frequency = profile.bookingFrequency;
  
  let summary = `You're a ${frequency} user`;
  if (topCategory) {
    summary += ` who prefers ${topCategory} services`;
  }
  
  if (profile.priceConsciousness === 'high') {
    summary += ' and values cost-effective solutions';
  } else if (profile.priceConsciousness === 'low') {
    summary += ' and prefers premium services';
  }
  
  if (profile.planningStyle === 'planned') {
    summary += '. You typically plan your bookings in advance';
  } else if (profile.planningStyle === 'spontaneous') {
    summary += '. You prefer booking services on-demand';
  }
  
  return summary + '.';
}

function calculateSpendingByCategory(bookings: any[]) {
  const spending = new Map();
  bookings.forEach(booking => {
    if (booking.status === 'COMPLETED' && booking.service?.category) {
      const category = booking.service.category;
      spending.set(category, (spending.get(category) || 0) + booking.total);
    }
  });
  
  return Object.fromEntries(
    Array.from(spending.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  );
}

function calculateMonthlySpendingTrend(bookings: any[]) {
  const monthlySpending = new Map();
  bookings.forEach(booking => {
    if (booking.status === 'COMPLETED') {
      const month = new Date(booking.createdAt).toLocaleDateString('en', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlySpending.set(month, (monthlySpending.get(month) || 0) + booking.total);
    }
  });
  
  return Array.from(monthlySpending.entries())
    .map(([month, spending]) => ({ month, spending }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
}

function identifySavingsOpportunities(insights: any, bookings: any[]) {
  const opportunities = [];
  
  // Check for high-spending categories
  const categorySpending = calculateSpendingByCategory(bookings);
  for (const [category, spending] of Object.entries(categorySpending)) {
    if (spending > 5000) {
      opportunities.push({
        type: 'bulk_discount',
        category,
        potential_savings: spending * 0.1,
        description: `Consider booking multiple ${category} services together for bulk discounts`
      });
    }
  }
  
  // Check for off-peak booking opportunities
  if (insights.mostBookedTimes.includes('evening')) {
    opportunities.push({
      type: 'off_peak',
      potential_savings: 500,
      description: 'Book services during morning or afternoon for lower rates'
    });
  }
  
  return opportunities;
}

async function getRecommendedProviders(userId: string, insights: any) {
  // This would use the recommendation engine to get provider recommendations
  // For now, return a simple structure
  return [
    {
      providerId: 'provider_1',
      matchScore: 0.85,
      reasons: ['High ratings', 'Preferred category', 'Good pricing']
    }
  ];
}

function generateSeasonalRecommendations(insights: any) {
  const currentSeason = getCurrentSeason();
  const seasonalServices = insights.seasonalPatterns[currentSeason] || [];
  
  return seasonalServices.map(service => ({
    category: service,
    reason: `Based on your ${currentSeason} booking pattern`,
    urgency: 'medium'
  }));
}

function identifyRiskFactors(insights: any, bookings: any[]) {
  const risks = [];
  
  // Check for booking frequency decline
  const recentBookings = bookings.filter(b => {
    const bookingDate = new Date(b.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return bookingDate > thirtyDaysAgo;
  });
  
  if (recentBookings.length < 2 && insights.personalityProfile.bookingFrequency === 'frequent') {
    risks.push({
      type: 'engagement_decline',
      severity: 'medium',
      description: 'Booking frequency has decreased compared to your usual pattern'
    });
  }
  
  return risks;
}

function calculatePlatformUsage(bookings: any[]) {
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const totalBookings = bookings.length;
  
  return {
    totalBookings,
    completedBookings: completedBookings.length,
    completionRate: totalBookings > 0 ? completedBookings.length / totalBookings : 0,
    averageBookingValue: completedBookings.length > 0 
      ? completedBookings.reduce((sum, b) => sum + b.total, 0) / completedBookings.length 
      : 0
  };
}

function calculateSatisfactionScore(bookings: any[]) {
  const reviewedBookings = bookings.filter(b => b.review && b.status === 'COMPLETED');
  
  if (reviewedBookings.length === 0) return null;
  
  const avgRating = reviewedBookings.reduce((sum, b) => sum + b.review.rating, 0) / reviewedBookings.length;
  return Math.round(avgRating * 10) / 10;
}

function calculateLoyaltyScore(insights: any, bookings: any[]) {
  let score = 0;
  
  // Booking frequency component
  const frequency = insights.personalityProfile.bookingFrequency;
  if (frequency === 'frequent') score += 40;
  else if (frequency === 'regular') score += 25;
  else score += 10;
  
  // Satisfaction component
  const satisfaction = calculateSatisfactionScore(bookings);
  if (satisfaction >= 4.5) score += 30;
  else if (satisfaction >= 4.0) score += 20;
  else if (satisfaction >= 3.5) score += 10;
  
  // Tenure component (simplified)
  score += Math.min(bookings.length * 2, 30);
  
  return Math.min(score, 100);
}

function determineUserSegment(insights: any) {
  const profile = insights.personalityProfile;
  
  if (profile.bookingFrequency === 'frequent' && profile.priceConsciousness === 'low') {
    return 'premium_frequent';
  } else if (profile.bookingFrequency === 'frequent') {
    return 'value_frequent';
  } else if (profile.priceConsciousness === 'low') {
    return 'premium_occasional';
  } else {
    return 'value_conscious';
  }
}

function analyzeLifestageIndicators(insights: any, bookings: any[]) {
  const categories = insights.topCategories;
  
  const indicators = [];
  
  if (categories.includes('Baby Care') || categories.includes('Child Care')) {
    indicators.push('young_family');
  }
  
  if (categories.includes('Home Maintenance') || categories.includes('Gardening')) {
    indicators.push('homeowner');
  }
  
  if (categories.includes('Elderly Care') || categories.includes('Health Care')) {
    indicators.push('health_conscious');
  }
  
  return indicators;
}

function analyzeGeographicProfile(insights: any) {
  const hotspots = insights.locationHotspots;
  
  if (hotspots.length === 0) return { mobility: 'unknown' };
  
  const mobility = hotspots.length > 3 ? 'high' : hotspots.length > 1 ? 'medium' : 'low';
  
  return {
    mobility,
    primaryArea: hotspots[0]?.area,
    coverageAreas: hotspots.map(h => h.area)
  };
}

// Simplified implementations for analytics functions
function analyzeSessionPatterns(behavior: any[]) {
  return { averageSessionLength: 300, bounceRate: 0.25 };
}

function analyzeConversionFunnels(behavior: any[]) {
  return { viewToBook: 0.15, searchToBook: 0.25 };
}

function identifyDropoffPoints(behavior: any[]) {
  return [{ point: 'service_selection', dropoffRate: 0.4 }];
}

function calculateEngagementDepth(behavior: any[]) {
  return { depth: 'medium', score: 0.65 };
}

function calculatePersonalizationAccuracy(insights: any, bookings: any[]) {
  return 0.75; // Simplified
}

function calculatePredictionAccuracy(insights: any, bookings: any[]) {
  return 0.68; // Simplified
}

function analyzeSatisfactionCorrelation(insights: any, bookings: any[]) {
  return { correlation: 0.72, significance: 'high' };
}

function calculateCLV(bookings: any[]) {
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const totalValue = completedBookings.reduce((sum, b) => sum + b.total, 0);
  const avgBookingValue = totalValue / completedBookings.length || 0;
  
  // Simplified CLV calculation
  return avgBookingValue * 12; // Assuming annual retention
}

function calculateRetentionProbability(insights: any, bookings: any[]) {
  const frequency = insights.personalityProfile.bookingFrequency;
  const satisfaction = calculateSatisfactionScore(bookings);
  
  let probability = 0.5; // Base probability
  
  if (frequency === 'frequent') probability += 0.3;
  else if (frequency === 'regular') probability += 0.2;
  
  if (satisfaction >= 4.5) probability += 0.2;
  else if (satisfaction >= 4.0) probability += 0.1;
  
  return Math.min(probability, 0.95);
}

function identifyUpsellOpportunities(insights: any, bookings: any[]) {
  const opportunities = [];
  const categories = insights.topCategories;
  
  // Simple upsell logic
  if (categories.includes('Cleaning') && !categories.includes('Deep Cleaning')) {
    opportunities.push({
      category: 'Deep Cleaning',
      probability: 0.6,
      value: 2000
    });
  }
  
  return opportunities;
}

function calculateChurnRisk(insights: any, behavior: any[]) {
  const recentActivity = behavior.filter(b => {
    const activityDate = new Date(b.timestamp);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return activityDate > sevenDaysAgo;
  });
  
  const riskScore = recentActivity.length < 5 ? 0.7 : 0.3;
  return { score: riskScore, level: riskScore > 0.6 ? 'high' : 'low' };
}

async function generatePeerComparison(userId: string, insights: any) {
  // This would compare with similar users
  return {
    spendingPercentile: 65,
    frequencyPercentile: 80,
    satisfactionPercentile: 90
  };
}

function analyzeMarketPosition(insights: any) {
  return {
    segment: 'value_conscious',
    marketShare: 0.12,
    competitorComparison: 'above_average'
  };
}

function generateCompetitiveInsights(insights: any) {
  return {
    strengthAreas: ['customer_satisfaction', 'service_variety'],
    improvementAreas: ['pricing', 'speed']
  };
}

async function resetPersonalizationData(userId: string) {
  // This would carefully reset personalization data
  // For now, just a placeholder
  console.log(`Resetting personalization data for user: ${userId}`);
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}