import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface UXAnalyticsData {
  interactionType: string;
  elementId: string;
  duration: number;
  context?: any;
  satisfaction?: number;
  deviceType?: string;
  screenSize?: string;
}

// POST /api/ux/analytics - Log UX interaction analytics
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const {
      interactionType,
      elementId,
      duration,
      context = {},
      satisfaction,
      deviceType,
      screenSize
    }: UXAnalyticsData = body;

    // Validate required fields
    if (!interactionType || !elementId || duration === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: interactionType, elementId, duration' },
        { status: 400 }
      );
    }

    // Validate satisfaction rating if provided
    if (satisfaction !== undefined && (satisfaction < 1 || satisfaction > 5)) {
      return NextResponse.json(
        { error: 'Satisfaction rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Detect device type if not provided
    const userAgent = request.headers.get('user-agent') || '';
    const detectedDeviceType = deviceType || 
      (userAgent.includes('Mobile') ? 'mobile' : 
       userAgent.includes('Tablet') ? 'tablet' : 'desktop');

    // Enhanced context with request metadata
    const enhancedContext = {
      ...context,
      userAgent,
      referer: request.headers.get('referer'),
      timestamp: new Date().toISOString(),
      sessionId: request.headers.get('x-session-id') || 'anonymous'
    };

    // Create analytics record
    const analyticsRecord = await prisma.uXAnalytics.create({
      data: {
        userId: session?.user?.id || null,
        interactionType,
        elementId,
        duration,
        context: enhancedContext,
        satisfaction,
        deviceType: detectedDeviceType,
        screenSize: screenSize || 'unknown'
      }
    });

    // Process analytics for insights (async, don't block response)
    processAnalyticsInsights(analyticsRecord).catch(error => {
      console.error('Error processing analytics insights:', error);
    });

    return NextResponse.json(
      { 
        message: 'Analytics logged successfully',
        id: analyticsRecord.id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error logging UX analytics:', error);
    return NextResponse.json(
      { error: 'Failed to log analytics' },
      { status: 500 }
    );
  }
}

// GET /api/ux/analytics - Retrieve UX analytics data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const interactionType = searchParams.get('interactionType');
    const elementId = searchParams.get('elementId');
    const deviceType = searchParams.get('deviceType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter conditions
    const where: any = { userId: session.user.id };
    if (interactionType) where.interactionType = interactionType;
    if (elementId) where.elementId = elementId;
    if (deviceType) where.deviceType = deviceType;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    // Fetch analytics data
    const analyticsData = await prisma.uXAnalytics.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: Math.min(limit, 1000), // Cap at 1000 records
      skip: offset,
      select: {
        id: true,
        interactionType: true,
        elementId: true,
        duration: true,
        context: true,
        satisfaction: true,
        deviceType: true,
        screenSize: true,
        timestamp: true
      }
    });

    // Get analytics summary
    const summary = await getAnalyticsSummary(session.user.id, where);

    return NextResponse.json({
      data: analyticsData,
      summary,
      pagination: {
        limit,
        offset,
        total: analyticsData.length
      }
    });
  } catch (error) {
    console.error('Error fetching UX analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// DELETE /api/ux/analytics - Clear user's analytics data
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const olderThanDays = parseInt(searchParams.get('olderThanDays') || '0');

    const where: any = { userId: session.user.id };
    
    // Only delete records older than specified days
    if (olderThanDays > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      where.timestamp = { lt: cutoffDate };
    }

    // Delete analytics records
    const deleteResult = await prisma.uXAnalytics.deleteMany({ where });

    return NextResponse.json({
      message: `Successfully deleted ${deleteResult.count} analytics records`,
      deletedCount: deleteResult.count
    });
  } catch (error) {
    console.error('Error deleting UX analytics:', error);
    return NextResponse.json(
      { error: 'Failed to delete analytics' },
      { status: 500 }
    );
  }
}

// Helper function to get analytics summary
async function getAnalyticsSummary(userId: string, whereClause: any) {
  try {
    const [
      totalInteractions,
      avgDuration,
      topInteractionTypes,
      deviceBreakdown,
      satisfactionStats
    ] = await Promise.all([
      // Total interactions count
      prisma.uXAnalytics.count({ where: whereClause }),
      
      // Average interaction duration
      prisma.uXAnalytics.aggregate({
        where: whereClause,
        _avg: { duration: true }
      }),
      
      // Top interaction types
      prisma.uXAnalytics.groupBy({
        by: ['interactionType'],
        where: whereClause,
        _count: { interactionType: true },
        orderBy: { _count: { interactionType: 'desc' } },
        take: 10
      }),
      
      // Device type breakdown
      prisma.uXAnalytics.groupBy({
        by: ['deviceType'],
        where: whereClause,
        _count: { deviceType: true }
      }),
      
      // Satisfaction statistics
      prisma.uXAnalytics.aggregate({
        where: {
          ...whereClause,
          satisfaction: { not: null }
        },
        _avg: { satisfaction: true },
        _count: { satisfaction: true },
        _min: { satisfaction: true },
        _max: { satisfaction: true }
      })
    ]);

    return {
      totalInteractions,
      avgDuration: Math.round(avgDuration._avg.duration || 0),
      topInteractionTypes: topInteractionTypes.map(item => ({
        type: item.interactionType,
        count: item._count.interactionType
      })),
      deviceBreakdown: deviceBreakdown.map(item => ({
        device: item.deviceType,
        count: item._count.deviceType
      })),
      satisfaction: {
        average: satisfactionStats._avg.satisfaction,
        totalRatings: satisfactionStats._count.satisfaction,
        min: satisfactionStats._min.satisfaction,
        max: satisfactionStats._max.satisfaction
      }
    };
  } catch (error) {
    console.error('Error generating analytics summary:', error);
    return null;
  }
}

// Helper function to process analytics for insights
async function processAnalyticsInsights(analyticsRecord: any) {
  try {
    // Extract patterns and insights from the analytics data
    const userId = analyticsRecord.userId;
    if (!userId) return;

    // Check for potential UX issues
    const issues = [];

    // Long interaction duration detection
    if (analyticsRecord.duration > 5000) { // 5 seconds
      issues.push({
        type: 'long_interaction',
        severity: 'medium',
        element: analyticsRecord.elementId,
        duration: analyticsRecord.duration
      });
    }

    // Repeated failed interactions
    if (analyticsRecord.context?.error || analyticsRecord.context?.failed) {
      const recentFailures = await prisma.uXAnalytics.count({
        where: {
          userId,
          elementId: analyticsRecord.elementId,
          timestamp: {
            gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
          },
          context: {
            path: ['error'],
            not: null
          }
        }
      });

      if (recentFailures >= 3) {
        issues.push({
          type: 'repeated_failures',
          severity: 'high',
          element: analyticsRecord.elementId,
          count: recentFailures
        });
      }
    }

    // Low satisfaction patterns
    if (analyticsRecord.satisfaction && analyticsRecord.satisfaction <= 2) {
      const lowSatisfactionCount = await prisma.uXAnalytics.count({
        where: {
          userId,
          satisfaction: { lte: 2 },
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      if (lowSatisfactionCount >= 5) {
        issues.push({
          type: 'low_satisfaction_pattern',
          severity: 'high',
          count: lowSatisfactionCount
        });
      }
    }

    // Store insights for contextual AI to use
    if (issues.length > 0) {
      await prisma.contextualData.create({
        data: {
          userId,
          contextType: 'ux_issues',
          contextValue: {
            issues,
            detectedAt: new Date().toISOString(),
            triggerElement: analyticsRecord.elementId,
            triggerInteraction: analyticsRecord.interactionType
          },
          uiAdaptations: [] // Will be populated by contextual AI
        }
      });
    }

    // Update user behavior patterns
    await updateBehaviorPatterns(userId, analyticsRecord);

  } catch (error) {
    console.error('Error processing analytics insights:', error);
  }
}

// Helper function to update user behavior patterns
async function updateBehaviorPatterns(userId: string, analyticsRecord: any) {
  try {
    // Find or create behavior entry
    const behaviorEntry = await prisma.userBehavior.create({
      data: {
        userId,
        action: analyticsRecord.interactionType,
        category: getInteractionCategory(analyticsRecord.interactionType),
        timeSpent: analyticsRecord.duration,
        deviceType: analyticsRecord.deviceType,
        sessionId: analyticsRecord.context?.sessionId || 'unknown',
        clickTarget: analyticsRecord.elementId
      }
    });

    // Update personalization insights based on patterns
    const insights = await prisma.personalizationInsights.findUnique({
      where: { userId }
    });

    if (insights) {
      // Update insights based on new interaction
      const updatedPatterns = {
        ...insights.bookingPatterns,
        recentInteractions: [
          ...(insights.bookingPatterns?.recentInteractions || []).slice(-19), // Keep last 20
          {
            type: analyticsRecord.interactionType,
            element: analyticsRecord.elementId,
            duration: analyticsRecord.duration,
            timestamp: analyticsRecord.timestamp
          }
        ]
      };

      await prisma.personalizationInsights.update({
        where: { userId },
        data: {
          bookingPatterns: updatedPatterns,
          lastAnalyzed: new Date()
        }
      });
    }
  } catch (error) {
    console.error('Error updating behavior patterns:', error);
  }
}

// Helper function to categorize interaction types
function getInteractionCategory(interactionType: string): string {
  const categoryMap = {
    'click': 'navigation',
    'haptic_feedback': 'tactile',
    'switch_toggle': 'control',
    'gesture_swipe': 'gesture',
    'gesture_longPress': 'gesture',
    'gesture_pinch': 'gesture',
    'voice_command': 'voice',
    'form_interaction': 'input',
    'preferences_change': 'settings'
  };

  return categoryMap[interactionType] || 'general';
}