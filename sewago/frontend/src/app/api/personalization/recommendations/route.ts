// GET /api/personalization/recommendations - Personalized service recommendations
import { NextRequest, NextResponse } from 'next/server';
import { RecommendationEngine } from '@/lib/personalization/recommendation-engine';
import { RecommendationRequest, PersonalizationAPIResponse } from '@/types/personalization';

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

    // Parse query parameters
    const algorithm = searchParams.get('algorithm') as RecommendationRequest['algorithm'] || 'hybrid';
    const limit = parseInt(searchParams.get('limit') || '10');
    const categories = searchParams.get('categories')?.split(',') || [];
    const maxDistance = parseInt(searchParams.get('maxDistance') || '10000');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    
    // Parse location if provided
    let currentLocation = null;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const area = searchParams.get('area');
    
    if (lat && lng) {
      currentLocation = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        area: area || undefined,
      };
    }

    // Parse context
    const timeOfDay = searchParams.get('timeOfDay');
    const dayOfWeek = searchParams.get('dayOfWeek');
    const season = searchParams.get('season');
    const urgency = searchParams.get('urgency') as 'low' | 'medium' | 'high' || 'medium';
    
    // Parse budget
    let budget = null;
    const budgetMin = searchParams.get('budgetMin');
    const budgetMax = searchParams.get('budgetMax');
    
    if (budgetMin || budgetMax) {
      budget = {
        min: budgetMin ? parseInt(budgetMin) : undefined,
        max: budgetMax ? parseInt(budgetMax) : undefined,
      };
    }

    // Construct recommendation request
    const recommendationRequest: RecommendationRequest = {
      userId,
      algorithm,
      context: {
        currentLocation,
        timeOfDay: timeOfDay || undefined,
        dayOfWeek: dayOfWeek || undefined,
        season: season || undefined,
        urgency,
        budget,
      },
      filters: {
        categories: categories.length > 0 ? categories : undefined,
        maxDistance,
        minRating,
      },
      limit,
    };

    const startTime = Date.now();
    
    // Get service recommendations
    const serviceRecommendations = await recommendationEngine.getServiceRecommendations(recommendationRequest);
    
    // Get provider recommendations
    const providerRecommendations = await recommendationEngine.getProviderRecommendations(recommendationRequest);

    const processingTime = Date.now() - startTime;

    const response: PersonalizationAPIResponse = {
      success: true,
      data: {
        services: serviceRecommendations,
        providers: providerRecommendations,
        metadata: {
          algorithm,
          totalServices: serviceRecommendations.length,
          totalProviders: providerRecommendations.length,
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
      },
      metadata: {
        processingTime,
        algorithm,
        cacheHit: false, // Would be determined by recommendation engine
        version: '1.0.0',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    
    const errorResponse: PersonalizationAPIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      metadata: {
        processingTime: 0,
        algorithm: 'hybrid',
        cacheHit: false,
        version: '1.0.0',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, preferences, context, filters, algorithm = 'hybrid', limit = 10 } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const recommendationRequest: RecommendationRequest = {
      userId,
      algorithm,
      context: context || {},
      filters: filters || {},
      limit,
    };

    const startTime = Date.now();
    
    // Get personalized recommendations
    const [serviceRecommendations, providerRecommendations] = await Promise.all([
      recommendationEngine.getServiceRecommendations(recommendationRequest),
      recommendationEngine.getProviderRecommendations(recommendationRequest),
    ]);

    const processingTime = Date.now() - startTime;

    const response: PersonalizationAPIResponse = {
      success: true,
      data: {
        services: serviceRecommendations,
        providers: providerRecommendations,
        personalizedFactors: {
          algorithmsUsed: [algorithm],
          contextFactors: Object.keys(context || {}),
          filtersApplied: Object.keys(filters || {}),
        },
        recommendations: {
          count: serviceRecommendations.length + providerRecommendations.length,
          averageConfidence: [...serviceRecommendations, ...providerRecommendations]
            .reduce((sum, rec) => sum + rec.confidence, 0) / 
            (serviceRecommendations.length + providerRecommendations.length) || 0,
        },
      },
      metadata: {
        processingTime,
        algorithm,
        cacheHit: false,
        version: '1.0.0',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing recommendation request:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}