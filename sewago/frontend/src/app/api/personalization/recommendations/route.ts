import { NextRequest, NextResponse } from 'next/server';
import { recommendationEngine } from '@/lib/personalization/recommendation-engine';
import { behaviorTracker } from '@/lib/personalization/behavior-tracker';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || undefined;
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
    const area = searchParams.get('area') || undefined;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Track recommendation request
    await behaviorTracker.trackEvent({
      userId,
      action: 'view',
      clickTarget: 'recommendations',
      deviceType: request.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop',
      sessionId: request.headers.get('x-session-id') || undefined
    });

    // Get recommendations
    const context = {
      userId,
      location: lat && lng ? { lat, lng, area } : undefined,
      currentCategory: category,
      timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                new Date().getHours() < 17 ? 'afternoon' : 'evening',
      season: getCurrentSeason(),
      deviceType: request.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop'
    };

    const recommendations = await recommendationEngine.getServiceRecommendations(context, limit);

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        context,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, serviceId, feedback, recommendationId } = body;

    if (!userId || !feedback) {
      return NextResponse.json(
        { error: 'userId and feedback are required' },
        { status: 400 }
      );
    }

    // Track recommendation feedback
    await behaviorTracker.trackRecommendationFeedback(
      userId,
      recommendationId,
      feedback,
      { serviceId }
    );

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully'
    });

  } catch (error) {
    console.error('Error recording recommendation feedback:', error);
    return NextResponse.json(
      { error: 'Failed to record feedback' },
      { status: 500 }
    );
  }
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}