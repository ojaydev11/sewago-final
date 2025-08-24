// POST /api/personalization/behavior - User behavior tracking
import { NextRequest, NextResponse } from 'next/server';
import { RecommendationEngine } from '@/lib/personalization/recommendation-engine';
import { UserBehavior, PersonalizationAPIResponse } from '@/types/personalization';

const recommendationEngine = new RecommendationEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, serviceId, providerId, category, timeSpent, deviceType, location, searchQuery, clickTarget, sessionId } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    // Validate action type
    const validActions = ['view', 'book', 'complete', 'review', 'search', 'click', 'favorite', 'share'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    // Create behavior record
    const behavior: Omit<UserBehavior, 'id' | 'timestamp'> = {
      userId,
      action,
      serviceId: serviceId || undefined,
      providerId: providerId || undefined,
      category: category || undefined,
      timeSpent: timeSpent || undefined,
      deviceType: deviceType || getDeviceTypeFromUserAgent(request.headers.get('user-agent')),
      location: location || undefined,
      searchQuery: searchQuery || undefined,
      clickTarget: clickTarget || undefined,
      sessionId: sessionId || generateSessionId(request),
    };

    // Track the behavior (this will also trigger insights update)
    await recommendationEngine.trackBehavior(behavior);

    // Return success response
    const response: PersonalizationAPIResponse = {
      success: true,
      data: {
        message: 'Behavior tracked successfully',
        behaviorId: `behavior_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        insights: {
          actionProcessed: action,
          recommendationsWillUpdate: ['view', 'book', 'complete', 'review'].includes(action),
          mlLearningTriggered: true,
        },
      },
      metadata: {
        processingTime: Date.now(),
        algorithm: 'behavior-tracking',
        cacheHit: false,
        version: '1.0.0',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error tracking user behavior:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Batch behavior tracking for performance
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { behaviors, userId } = body;

    if (!behaviors || !Array.isArray(behaviors) || behaviors.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Behaviors array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required for batch tracking' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const processedBehaviors = [];
    const errors = [];

    // Process behaviors in parallel (with concurrency limit)
    const concurrencyLimit = 5;
    for (let i = 0; i < behaviors.length; i += concurrencyLimit) {
      const batch = behaviors.slice(i, i + concurrencyLimit);
      
      const batchPromises = batch.map(async (behaviorData, index) => {
        try {
          // Validate each behavior
          if (!behaviorData.action) {
            throw new Error(`Behavior at index ${i + index} missing required action`);
          }

          const behavior: Omit<UserBehavior, 'id' | 'timestamp'> = {
            userId: behaviorData.userId || userId,
            action: behaviorData.action,
            serviceId: behaviorData.serviceId || undefined,
            providerId: behaviorData.providerId || undefined,
            category: behaviorData.category || undefined,
            timeSpent: behaviorData.timeSpent || undefined,
            deviceType: behaviorData.deviceType || getDeviceTypeFromUserAgent(request.headers.get('user-agent')),
            location: behaviorData.location || undefined,
            searchQuery: behaviorData.searchQuery || undefined,
            clickTarget: behaviorData.clickTarget || undefined,
            sessionId: behaviorData.sessionId || generateSessionId(request),
          };

          await recommendationEngine.trackBehavior(behavior);
          
          processedBehaviors.push({
            index: i + index,
            success: true,
            action: behavior.action,
          });
        } catch (error) {
          errors.push({
            index: i + index,
            error: error instanceof Error ? error.message : 'Unknown error',
            action: behaviorData.action || 'unknown',
          });
        }
      });

      await Promise.allSettled(batchPromises);
    }

    const processingTime = Date.now() - startTime;

    const response: PersonalizationAPIResponse = {
      success: errors.length === 0,
      data: {
        message: `Processed ${processedBehaviors.length} behaviors successfully`,
        processed: processedBehaviors.length,
        failed: errors.length,
        total: behaviors.length,
        processedBehaviors,
        errors: errors.length > 0 ? errors : undefined,
        insights: {
          batchSize: behaviors.length,
          concurrencyLimit,
          mlLearningTriggered: processedBehaviors.length > 0,
          recommendationsWillUpdate: processedBehaviors.some(b => 
            ['view', 'book', 'complete', 'review'].includes(b.action)
          ),
        },
      },
      metadata: {
        processingTime,
        algorithm: 'batch-behavior-tracking',
        cacheHit: false,
        version: '1.0.0',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in batch behavior tracking:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Get user behavior analytics (for admin/analytics purposes)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '30');
    const actions = searchParams.get('actions')?.split(',') || [];

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // This would fetch behavior analytics from the database
    // For now, return mock analytics data
    const analytics = {
      userId,
      timeframe: {
        days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      },
      summary: {
        totalActions: 45,
        uniqueServices: 12,
        uniqueProviders: 8,
        averageSessionDuration: 180, // seconds
        mostActiveHours: ['10:00', '14:00', '19:00'],
        mostActiveDays: ['Saturday', 'Sunday', 'Wednesday'],
      },
      actionBreakdown: {
        view: 25,
        search: 10,
        click: 8,
        book: 3,
        complete: 2,
        review: 2,
        favorite: 1,
        share: 0,
      },
      categoryInteraction: [
        { category: 'cleaning', actions: 18, percentage: 40 },
        { category: 'maintenance', actions: 12, percentage: 27 },
        { category: 'beauty', actions: 8, percentage: 18 },
        { category: 'delivery', actions: 7, percentage: 15 },
      ],
      devices: {
        mobile: 70,
        desktop: 25,
        tablet: 5,
      },
      locationPatterns: [
        { area: 'Kathmandu', frequency: 60 },
        { area: 'Lalitpur', frequency: 25 },
        { area: 'Bhaktapur', frequency: 15 },
      ],
    };

    const response: PersonalizationAPIResponse = {
      success: true,
      data: analytics,
      metadata: {
        processingTime: 0,
        algorithm: 'behavior-analytics',
        cacheHit: true,
        version: '1.0.0',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching behavior analytics:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Helper functions
function getDeviceTypeFromUserAgent(userAgent: string | null): 'mobile' | 'desktop' | 'tablet' {
  if (!userAgent) return 'desktop';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  }
  
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  
  return 'desktop';
}

function generateSessionId(request: NextRequest): string {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const timestamp = Date.now();
  
  // Create a simple session ID based on IP, user agent, and timestamp
  const sessionData = `${ip}-${userAgent}-${Math.floor(timestamp / (30 * 60 * 1000))}`; // 30 minute sessions
  
  // Simple hash function (in production, use a proper hash)
  let hash = 0;
  for (let i = 0; i < sessionData.length; i++) {
    const char = sessionData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `session_${Math.abs(hash).toString(36)}`;
}