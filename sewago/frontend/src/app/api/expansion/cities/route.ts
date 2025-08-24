import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const cityDataSchema = z.object({
  cityName: z.string().min(1, 'City name is required'),
  state: z.string().min(1, 'State is required'),
  population: z.number().positive('Population must be positive'),
  marketData: z.object({
    averageIncome: z.number().positive().optional(),
    urbanization: z.number().min(0).max(100).optional(), // percentage
    internetPenetration: z.number().min(0).max(100).optional(), // percentage
    serviceAwareness: z.number().min(0).max(100).optional(), // percentage
    competitorCount: z.number().min(0).optional(),
    demographics: z.object({
      youngProfessionals: z.number().min(0).max(100).optional(), // percentage
      families: z.number().min(0).max(100).optional(), // percentage
      seniors: z.number().min(0).max(100).optional(), // percentage
    }).optional(),
  }),
  localizationNeeds: z.object({
    primaryLanguage: z.string(),
    secondaryLanguages: z.array(z.string()).optional(),
    culturalFactors: z.array(z.string()).optional(),
    localCustoms: z.array(z.string()).optional(),
    festivalCalendar: z.array(z.object({
      name: z.string(),
      date: z.string(),
      importance: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    })).optional(),
  }),
  targetLaunchDate: z.string().transform(str => new Date(str)).optional(),
  investmentRequired: z.number().min(0).optional(),
  expectedROI: z.number().optional(),
});

// GET /api/expansion/cities - Get city expansion data
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const includeAnalysis = url.searchParams.get('includeAnalysis') !== 'false';
    const sortBy = url.searchParams.get('sortBy') || 'marketPotential';

    const whereClause: any = {};
    if (status) whereClause.launchStatus = status;

    const cities = await prisma.cityExpansionData.findMany({
      where: whereClause,
      orderBy: { [sortBy]: 'desc' },
    });

    // Calculate market analysis for each city
    let citiesWithAnalysis = cities;
    if (includeAnalysis) {
      citiesWithAnalysis = await Promise.all(
        cities.map(async (city) => {
          const analysis = await calculateMarketAnalysis(city);
          return { ...city, analysis };
        })
      );
    }

    // Get expansion summary
    const summary = {
      totalCities: cities.length,
      statusBreakdown: {
        RESEARCH: cities.filter(c => c.launchStatus === 'RESEARCH').length,
        PLANNING: cities.filter(c => c.launchStatus === 'PLANNING').length,
        PREPARATION: cities.filter(c => c.launchStatus === 'PREPARATION').length,
        LAUNCH: cities.filter(c => c.launchStatus === 'LAUNCH').length,
        ACTIVE: cities.filter(c => c.launchStatus === 'ACTIVE').length,
        PAUSED: cities.filter(c => c.launchStatus === 'PAUSED').length,
        DISCONTINUED: cities.filter(c => c.launchStatus === 'DISCONTINUED').length,
      },
      totalInvestment: cities.reduce((sum, c) => sum + c.investmentRequired, 0),
      averageMarketPotential: cities.length > 0 
        ? cities.reduce((sum, c) => sum + c.marketPotential, 0) / cities.length 
        : 0,
      topOpportunities: citiesWithAnalysis
        .sort((a, b) => b.marketPotential - a.marketPotential)
        .slice(0, 5),
    };

    return NextResponse.json({
      cities: citiesWithAnalysis,
      summary,
    });
  } catch (error) {
    console.error('City expansion data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch city expansion data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/expansion/cities - Add new city for expansion analysis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate city data
    const validatedData = cityDataSchema.parse(body);

    // Check if city already exists
    const existingCity = await prisma.cityExpansionData.findUnique({
      where: { cityName: validatedData.cityName },
    });

    if (existingCity) {
      return NextResponse.json(
        { error: 'City already exists in expansion database' },
        { status: 400 }
      );
    }

    // Calculate market potential and competition level
    const marketAnalysis = calculateMarketPotentialScore(validatedData);
    const competitionAnalysis = calculateCompetitionLevel(validatedData);

    // Create city expansion data
    const cityData = await prisma.cityExpansionData.create({
      data: {
        ...validatedData,
        marketPotential: marketAnalysis.score,
        competitionLevel: competitionAnalysis.level,
        launchStatus: 'RESEARCH',
        successMetrics: {
          targetProviders: Math.floor(validatedData.population / 10000) * 5, // 5 providers per 10k people
          targetBookings: Math.floor(validatedData.population / 1000) * 2, // 2 bookings per 1k people monthly
          targetRevenue: Math.floor(validatedData.population / 100) * 15000, // NPR 150 per 100 people monthly
        },
      },
    });

    // Generate expansion recommendations
    const recommendations = await generateExpansionRecommendations(cityData);

    return NextResponse.json({
      city: cityData,
      marketAnalysis,
      competitionAnalysis,
      recommendations,
    });
  } catch (error) {
    console.error('Add city expansion error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add city expansion data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/expansion/cities - Update city expansion data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { cityId, ...updateData } = body;

    if (!cityId) {
      return NextResponse.json(
        { error: 'City ID is required' },
        { status: 400 }
      );
    }

    // Find existing city
    const existingCity = await prisma.cityExpansionData.findUnique({
      where: { id: cityId },
    });

    if (!existingCity) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    // Update city data
    const updatedCity = await prisma.cityExpansionData.update({
      where: { id: cityId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    // Recalculate market analysis if market data changed
    let analysis = null;
    if (updateData.marketData || updateData.population) {
      analysis = await calculateMarketAnalysis(updatedCity);
    }

    return NextResponse.json({
      city: updatedCity,
      analysis,
    });
  } catch (error) {
    console.error('Update city expansion error:', error);
    return NextResponse.json(
      { error: 'Failed to update city expansion data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to calculate market potential score
function calculateMarketPotentialScore(cityData: any) {
  let score = 0.5; // Base score
  const factors = [];

  // Population factor (normalized to 0-1 scale)
  const populationScore = Math.min(1, cityData.population / 1000000); // Max score at 1M population
  score += populationScore * 0.2;
  factors.push({ factor: 'Population Size', score: populationScore, weight: 0.2 });

  // Market data factors
  if (cityData.marketData) {
    const marketData = cityData.marketData;

    if (marketData.averageIncome) {
      const incomeScore = Math.min(1, marketData.averageIncome / 5000000); // Max score at NPR 50k monthly
      score += incomeScore * 0.15;
      factors.push({ factor: 'Average Income', score: incomeScore, weight: 0.15 });
    }

    if (marketData.urbanization) {
      const urbanScore = marketData.urbanization / 100;
      score += urbanScore * 0.15;
      factors.push({ factor: 'Urbanization', score: urbanScore, weight: 0.15 });
    }

    if (marketData.internetPenetration) {
      const internetScore = marketData.internetPenetration / 100;
      score += internetScore * 0.1;
      factors.push({ factor: 'Internet Penetration', score: internetScore, weight: 0.1 });
    }

    if (marketData.serviceAwareness) {
      const awarenessScore = marketData.serviceAwareness / 100;
      score += awarenessScore * 0.1;
      factors.push({ factor: 'Service Awareness', score: awarenessScore, weight: 0.1 });
    }

    if (marketData.competitorCount !== undefined) {
      // Lower competition = higher potential
      const competitionScore = Math.max(0, 1 - (marketData.competitorCount / 10));
      score += competitionScore * 0.1;
      factors.push({ factor: 'Competition Level', score: competitionScore, weight: 0.1 });
    }

    if (marketData.demographics?.youngProfessionals) {
      const professionalsScore = marketData.demographics.youngProfessionals / 100;
      score += professionalsScore * 0.1;
      factors.push({ factor: 'Young Professionals', score: professionalsScore, weight: 0.1 });
    }
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    factors,
    rating: score > 0.8 ? 'Excellent' : score > 0.6 ? 'Good' : score > 0.4 ? 'Fair' : 'Poor',
  };
}

// Helper function to calculate competition level
function calculateCompetitionLevel(cityData: any) {
  let level = 0.5; // Base level
  const factors = [];

  if (cityData.marketData?.competitorCount !== undefined) {
    // Normalize competitor count (0-20 competitors scale)
    const competitorLevel = Math.min(1, cityData.marketData.competitorCount / 20);
    level = competitorLevel;
    factors.push({ factor: 'Direct Competitors', count: cityData.marketData.competitorCount });
  }

  // Adjust based on market maturity indicators
  if (cityData.marketData?.serviceAwareness) {
    // Higher awareness often means more competition
    const awarenessImpact = (cityData.marketData.serviceAwareness / 100) * 0.3;
    level += awarenessImpact;
    factors.push({ factor: 'Market Awareness', impact: awarenessImpact });
  }

  if (cityData.marketData?.urbanization) {
    // More urban areas typically have more competition
    const urbanImpact = (cityData.marketData.urbanization / 100) * 0.2;
    level += urbanImpact;
    factors.push({ factor: 'Urbanization', impact: urbanImpact });
  }

  level = Math.max(0, Math.min(1, level));

  return {
    level,
    factors,
    rating: level > 0.8 ? 'Very High' : level > 0.6 ? 'High' : level > 0.4 ? 'Moderate' : 'Low',
    strategy: level > 0.7 
      ? 'Differentiation and premium positioning required'
      : level > 0.4 
      ? 'Competitive pricing and unique value proposition'
      : 'Market education and aggressive growth strategy',
  };
}

// Helper function to calculate comprehensive market analysis
async function calculateMarketAnalysis(cityData: any) {
  const marketPotential = calculateMarketPotentialScore(cityData);
  const competition = calculateCompetitionLevel(cityData);

  // Calculate launch readiness score
  const launchReadiness = calculateLaunchReadiness(cityData);

  // Estimate timeline and investment
  const timeline = estimateLaunchTimeline(cityData);
  const investment = estimateInvestmentRequirements(cityData);

  // Identify risks and opportunities
  const risks = identifyExpansionRisks(cityData);
  const opportunities = identifyExpansionOpportunities(cityData);

  return {
    marketPotential,
    competition,
    launchReadiness,
    timeline,
    investment,
    risks,
    opportunities,
    overallScore: (marketPotential.score + (1 - competition.level) + launchReadiness.score) / 3,
    recommendation: generateExpansionRecommendation(cityData, marketPotential, competition),
  };
}

function calculateLaunchReadiness(cityData: any) {
  let score = 0.3; // Base readiness
  const factors = [];

  // Infrastructure readiness
  if (cityData.marketData?.internetPenetration && cityData.marketData.internetPenetration > 60) {
    score += 0.2;
    factors.push('Good internet infrastructure');
  }

  // Market awareness
  if (cityData.marketData?.serviceAwareness && cityData.marketData.serviceAwareness > 40) {
    score += 0.2;
    factors.push('Existing service awareness');
  }

  // Urban development
  if (cityData.marketData?.urbanization && cityData.marketData.urbanization > 50) {
    score += 0.15;
    factors.push('Urban development ready');
  }

  // Local partnerships potential
  if (cityData.population > 100000) {
    score += 0.15;
    factors.push('Sufficient market size for partnerships');
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    factors,
    level: score > 0.8 ? 'High' : score > 0.5 ? 'Moderate' : 'Low',
  };
}

function estimateLaunchTimeline(cityData: any) {
  let months = 12; // Base timeline of 1 year

  // Reduce timeline for favorable conditions
  if (cityData.marketData?.serviceAwareness && cityData.marketData.serviceAwareness > 60) {
    months -= 2;
  }
  
  if (cityData.marketData?.competitorCount && cityData.marketData.competitorCount < 3) {
    months -= 3;
  }

  if (cityData.marketData?.internetPenetration && cityData.marketData.internetPenetration > 80) {
    months -= 1;
  }

  // Increase timeline for challenges
  if (cityData.localizationNeeds?.culturalFactors && cityData.localizationNeeds.culturalFactors.length > 3) {
    months += 2;
  }

  if (cityData.marketData?.competitorCount && cityData.marketData.competitorCount > 10) {
    months += 3;
  }

  return {
    estimated: Math.max(6, Math.min(24, months)), // Min 6 months, max 24 months
    phases: [
      { phase: 'Market Research & Validation', duration: 2 },
      { phase: 'Local Partnerships & Recruitment', duration: 3 },
      { phase: 'Marketing & Brand Awareness', duration: 2 },
      { phase: 'Soft Launch & Testing', duration: 2 },
      { phase: 'Full Launch & Scale', duration: 3 },
    ],
  };
}

function estimateInvestmentRequirements(cityData: any) {
  // Base investment in paisa (NPR)
  let baseInvestment = 50000000; // NPR 5 lakh base investment

  // Scale with population
  const populationMultiplier = Math.sqrt(cityData.population / 100000);
  baseInvestment *= populationMultiplier;

  // Adjust for competition
  if (cityData.marketData?.competitorCount && cityData.marketData.competitorCount > 5) {
    baseInvestment *= 1.5; // 50% more for competitive markets
  }

  // Adjust for localization needs
  if (cityData.localizationNeeds?.culturalFactors && cityData.localizationNeeds.culturalFactors.length > 2) {
    baseInvestment *= 1.2; // 20% more for complex localization
  }

  const breakdown = {
    marketing: Math.floor(baseInvestment * 0.4), // 40% for marketing
    operations: Math.floor(baseInvestment * 0.3), // 30% for operations
    technology: Math.floor(baseInvestment * 0.15), // 15% for technology
    partnerships: Math.floor(baseInvestment * 0.10), // 10% for partnerships
    contingency: Math.floor(baseInvestment * 0.05), // 5% contingency
  };

  return {
    total: Math.floor(baseInvestment),
    breakdown,
    paybackPeriod: 18, // Estimated 18 months payback
  };
}

function identifyExpansionRisks(cityData: any) {
  const risks = [];

  if (cityData.marketData?.competitorCount && cityData.marketData.competitorCount > 8) {
    risks.push({
      type: 'Market Risk',
      description: 'High competition may limit market share',
      severity: 'High',
      mitigation: 'Focus on differentiation and unique value proposition',
    });
  }

  if (cityData.marketData?.serviceAwareness && cityData.marketData.serviceAwareness < 30) {
    risks.push({
      type: 'Awareness Risk',
      description: 'Low market awareness requires extensive education',
      severity: 'Medium',
      mitigation: 'Implement comprehensive market education campaign',
    });
  }

  if (cityData.localizationNeeds?.culturalFactors && cityData.localizationNeeds.culturalFactors.length > 3) {
    risks.push({
      type: 'Cultural Risk',
      description: 'Complex cultural adaptation requirements',
      severity: 'Medium',
      mitigation: 'Partner with local cultural consultants and community leaders',
    });
  }

  if (cityData.population < 50000) {
    risks.push({
      type: 'Scale Risk',
      description: 'Small market size may not support sustainable operations',
      severity: 'High',
      mitigation: 'Consider regional expansion or adjacent market coverage',
    });
  }

  return risks;
}

function identifyExpansionOpportunities(cityData: any) {
  const opportunities = [];

  if (cityData.marketData?.competitorCount && cityData.marketData.competitorCount < 3) {
    opportunities.push({
      type: 'First Mover Advantage',
      description: 'Low competition allows for market leadership',
      potential: 'High',
      actionPlan: 'Rapid expansion and brand establishment',
    });
  }

  if (cityData.marketData?.demographics?.youngProfessionals && 
      cityData.marketData.demographics.youngProfessionals > 40) {
    opportunities.push({
      type: 'Target Demographics',
      description: 'High concentration of young professionals (ideal customer base)',
      potential: 'High',
      actionPlan: 'Digital-first marketing and tech-savvy service delivery',
    });
  }

  if (cityData.marketData?.averageIncome && cityData.marketData.averageIncome > 3000000) {
    opportunities.push({
      type: 'Premium Market',
      description: 'High average income supports premium service offerings',
      potential: 'Medium',
      actionPlan: 'Develop premium service tiers and value-added offerings',
    });
  }

  if (cityData.marketData?.internetPenetration && cityData.marketData.internetPenetration > 80) {
    opportunities.push({
      type: 'Digital Ready',
      description: 'High internet penetration supports digital platform adoption',
      potential: 'Medium',
      actionPlan: 'Leverage digital marketing and app-based service delivery',
    });
  }

  return opportunities;
}

function generateExpansionRecommendation(cityData: any, marketPotential: any, competition: any) {
  const overallScore = (marketPotential.score + (1 - competition.level)) / 2;

  if (overallScore > 0.8) {
    return {
      recommendation: 'HIGHLY RECOMMENDED',
      priority: 'HIGH',
      reasoning: 'Excellent market potential with manageable competition',
      nextSteps: [
        'Initiate detailed market research',
        'Begin local partnership discussions',
        'Develop localized marketing strategy',
      ],
    };
  } else if (overallScore > 0.6) {
    return {
      recommendation: 'RECOMMENDED',
      priority: 'MEDIUM',
      reasoning: 'Good market opportunity with strategic considerations',
      nextSteps: [
        'Conduct competitive analysis',
        'Evaluate differentiation strategies',
        'Test market with pilot program',
      ],
    };
  } else if (overallScore > 0.4) {
    return {
      recommendation: 'CONDITIONAL',
      priority: 'LOW',
      reasoning: 'Market potential exists but requires careful strategy',
      nextSteps: [
        'Address identified risks',
        'Develop unique value proposition',
        'Consider phased entry approach',
      ],
    };
  } else {
    return {
      recommendation: 'NOT RECOMMENDED',
      priority: 'NONE',
      reasoning: 'Market challenges outweigh opportunities',
      nextSteps: [
        'Monitor market development',
        'Reassess in 12-18 months',
        'Consider alternative markets',
      ],
    };
  }
}

async function generateExpansionRecommendations(cityData: any) {
  const recommendations = [];

  // Marketing recommendations
  recommendations.push({
    category: 'Marketing Strategy',
    items: [
      {
        title: 'Local Partnership Marketing',
        description: 'Partner with local businesses and community organizations',
        priority: 'High',
        timeline: '1-2 months',
      },
      {
        title: 'Digital Marketing Campaign',
        description: 'Focus on social media and search marketing for tech-savvy audience',
        priority: 'High',
        timeline: '2-3 months',
      },
    ],
  });

  // Operations recommendations
  recommendations.push({
    category: 'Operations Setup',
    items: [
      {
        title: 'Provider Recruitment',
        description: 'Recruit and train local service providers',
        priority: 'High',
        timeline: '2-4 months',
      },
      {
        title: 'Quality Standards',
        description: 'Establish local quality control and customer service standards',
        priority: 'Medium',
        timeline: '3-4 months',
      },
    ],
  });

  // Technology recommendations
  if (cityData.localizationNeeds?.primaryLanguage !== 'English') {
    recommendations.push({
      category: 'Technology & Localization',
      items: [
        {
          title: 'Platform Localization',
          description: `Translate platform to ${cityData.localizationNeeds.primaryLanguage}`,
          priority: 'High',
          timeline: '1-2 months',
        },
      ],
    });
  }

  return recommendations;
}