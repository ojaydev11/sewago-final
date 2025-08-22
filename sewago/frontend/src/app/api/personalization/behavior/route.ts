import { NextRequest, NextResponse } from 'next/server';
import { behaviorTracker } from '@/lib/personalization/behavior-tracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, events, event } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Handle single event or multiple events
    if (event) {
      // Single event tracking
      await behaviorTracker.trackEvent({
        userId,
        ...event,
        deviceType: event.deviceType || getDeviceType(request),
        sessionId: event.sessionId || request.headers.get('x-session-id') || undefined
      });
    } else if (events && Array.isArray(events)) {
      // Batch event tracking
      const eventsWithDefaults = events.map(evt => ({
        userId,
        ...evt,
        deviceType: evt.deviceType || getDeviceType(request),
        sessionId: evt.sessionId || request.headers.get('x-session-id') || undefined
      }));
      
      await behaviorTracker.trackEvents(eventsWithDefaults);
    } else {
      return NextResponse.json(
        { error: 'Either event or events array is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Behavior tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking behavior:', error);
    return NextResponse.json(
      { error: 'Failed to track behavior' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '30');
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get user insights
    const insights = await behaviorTracker.getUserInsights(userId);

    if (!insights) {
      return NextResponse.json({
        success: true,
        data: {
          insights: null,
          message: 'No insights available yet. Start using the platform to generate personalized insights!'
        }
      });
    }

    // Get recent behavior summary if requested
    let behaviorSummary = null;
    if (action === 'summary') {
      behaviorSummary = await getBehaviorSummary(userId, days);
    }

    return NextResponse.json({
      success: true,
      data: {
        insights,
        behaviorSummary,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting behavior insights:', error);
    return NextResponse.json(
      { error: 'Failed to get behavior insights' },
      { status: 500 }
    );
  }
}

// Utility function to get device type from request headers
function getDeviceType(request: NextRequest): 'mobile' | 'desktop' | 'tablet' {
  const userAgent = request.headers.get('user-agent') || '';
  
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    if (/iPad/.test(userAgent)) return 'tablet';
    return 'mobile';
  }
  
  return 'desktop';
}

// Helper function to get behavior summary
async function getBehaviorSummary(userId: string, days: number) {
  // This would fetch and summarize user behavior over the specified period
  // For now, return a mock summary structure
  
  const summary = {
    period: `Last ${days} days`,
    totalActions: 0,
    actionBreakdown: {
      view: 0,
      search: 0,
      click: 0,
      book: 0,
      review: 0
    },
    topCategories: [],
    deviceUsage: {
      mobile: 0,
      desktop: 0,
      tablet: 0
    },
    timePatterns: {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    },
    locationActivity: [],
    engagementScore: 0
  };

  // Note: In a real implementation, you would query the database here
  // to calculate actual behavior statistics

  return summary;
}