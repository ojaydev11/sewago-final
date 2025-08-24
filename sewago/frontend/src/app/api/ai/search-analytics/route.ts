import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { 
      action, 
      sessionId, 
      query, 
      resultId, 
      userId, 
      position,
      timestamp 
    } = body;

    if (!sessionId || !action) {
      return NextResponse.json(
        { error: 'Session ID and action are required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'search_performed':
        await trackSearchPerformed(sessionId, query, userId, timestamp);
        break;
      
      case 'result_clicked':
        await trackResultClick(sessionId, resultId, position, userId, timestamp);
        break;
      
      case 'search_abandoned':
        await trackSearchAbandoned(sessionId, userId, timestamp);
        break;
      
      case 'query_corrected':
        await trackQueryCorrected(sessionId, query, body.correctedQuery, userId, timestamp);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d';
    const userId = searchParams.get('userId');

    const analytics = await generateSearchAnalytics(timeframe, userId);

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Get search analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function trackSearchPerformed(
  sessionId: string,
  query: string,
  userId: string | null,
  timestamp: string | null
) {
  const searchBehavior = await prisma.searchBehavior.findFirst({
    where: {
      sessionId,
      query: {
        equals: query,
        mode: 'insensitive'
      }
    }
  });

  if (searchBehavior) {
    // Update existing search behavior
    await prisma.searchBehavior.update({
      where: { id: searchBehavior.id },
      data: {
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      }
    });
  } else {
    // This should typically be created by the predict endpoint
    console.warn('Search behavior not found for session:', sessionId);
  }
}

async function trackResultClick(
  sessionId: string,
  resultId: string,
  position: number,
  userId: string | null,
  timestamp: string | null
) {
  const searchBehavior = await prisma.searchBehavior.findFirst({
    where: { sessionId },
    orderBy: { timestamp: 'desc' }
  });

  if (searchBehavior) {
    const newClick = {
      resultId,
      position,
      clickedAt: timestamp || new Date().toISOString()
    };

    const updatedClicks = Array.isArray(searchBehavior.resultClicks)
      ? [...searchBehavior.resultClicks as any[], newClick]
      : [newClick];

    await prisma.searchBehavior.update({
      where: { id: searchBehavior.id },
      data: {
        resultClicks: updatedClicks
      }
    });
  }
}

async function trackSearchAbandoned(
  sessionId: string,
  userId: string | null,
  timestamp: string | null
) {
  const searchBehavior = await prisma.searchBehavior.findFirst({
    where: { sessionId },
    orderBy: { timestamp: 'desc' }
  });

  if (searchBehavior) {
    await prisma.searchBehavior.update({
      where: { id: searchBehavior.id },
      data: {
        abandonedAt: timestamp ? new Date(timestamp) : new Date()
      }
    });
  }
}

async function trackQueryCorrected(
  sessionId: string,
  originalQuery: string,
  correctedQuery: string,
  userId: string | null,
  timestamp: string | null
) {
  const searchBehavior = await prisma.searchBehavior.findFirst({
    where: { 
      sessionId,
      query: originalQuery
    },
    orderBy: { timestamp: 'desc' }
  });

  if (searchBehavior) {
    await prisma.searchBehavior.update({
      where: { id: searchBehavior.id },
      data: {
        correctedQuery
      }
    });
  }
}

async function generateSearchAnalytics(timeframe: string, userId: string | null) {
  const timeframeDays = getTimeframeDays(timeframe);
  const startDate = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);

  const whereClause: any = {
    timestamp: {
      gte: startDate
    }
  };

  if (userId) {
    whereClause.userId = userId;
  }

  // Total searches
  const totalSearches = await prisma.searchBehavior.count({
    where: whereClause
  });

  // Top queries
  const topQueries = await prisma.searchBehavior.groupBy({
    by: ['query'],
    where: whereClause,
    _count: {
      query: true
    },
    orderBy: {
      _count: {
        query: 'desc'
      }
    },
    take: 10
  });

  // Search success rate (searches with clicks vs without)
  const searchesWithClicks = await prisma.searchBehavior.count({
    where: {
      ...whereClause,
      NOT: {
        resultClicks: {
          equals: []
        }
      }
    }
  });

  const successRate = totalSearches > 0 ? (searchesWithClicks / totalSearches) * 100 : 0;

  // Abandonment rate
  const abandonedSearches = await prisma.searchBehavior.count({
    where: {
      ...whereClause,
      abandonedAt: {
        not: null
      }
    }
  });

  const abandonmentRate = totalSearches > 0 ? (abandonedSearches / totalSearches) * 100 : 0;

  // Query corrections
  const correctedQueries = await prisma.searchBehavior.count({
    where: {
      ...whereClause,
      correctedQuery: {
        not: null
      }
    }
  });

  // Device breakdown
  const deviceBreakdown = await prisma.searchBehavior.groupBy({
    by: ['deviceType'],
    where: whereClause,
    _count: {
      deviceType: true
    }
  });

  // Daily search trends
  const dailyTrends = await getDailySearchTrends(whereClause);

  // Popular categories from searches
  const searchBehaviors = await prisma.searchBehavior.findMany({
    where: whereClause,
    select: {
      query: true
    },
    take: 1000
  });

  const categoryInsights = await analyzeCategoryInsights(searchBehaviors);

  return {
    summary: {
      totalSearches,
      successRate: Math.round(successRate * 100) / 100,
      abandonmentRate: Math.round(abandonmentRate * 100) / 100,
      correctionRate: totalSearches > 0 ? Math.round((correctedQueries / totalSearches) * 10000) / 100 : 0
    },
    topQueries: topQueries.map(q => ({
      query: q.query,
      count: q._count.query
    })),
    deviceBreakdown: deviceBreakdown.map(d => ({
      device: d.deviceType || 'unknown',
      count: d._count.deviceType
    })),
    dailyTrends,
    categoryInsights,
    timeframe
  };
}

function getTimeframeDays(timeframe: string): number {
  switch (timeframe) {
    case '1d': return 1;
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    default: return 7;
  }
}

async function getDailySearchTrends(whereClause: any) {
  // This is a simplified version - in production you'd want more sophisticated date grouping
  const searches = await prisma.searchBehavior.findMany({
    where: whereClause,
    select: {
      timestamp: true
    },
    orderBy: {
      timestamp: 'desc'
    }
  });

  const dailyGroups: { [key: string]: number } = {};
  
  searches.forEach(search => {
    const date = search.timestamp.toISOString().split('T')[0];
    dailyGroups[date] = (dailyGroups[date] || 0) + 1;
  });

  return Object.entries(dailyGroups)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function analyzeCategoryInsights(searchBehaviors: any[]) {
  const queries = searchBehaviors.map(s => s.query.toLowerCase());
  
  // Simple category detection based on keywords
  const categories = {
    'Cleaning': ['clean', 'wash', 'sanitiz', 'disinfect', 'sweep', 'mop'],
    'Electrical': ['electric', 'wiring', 'power', 'outlet', 'switch', 'light'],
    'Plumbing': ['plumb', 'pipe', 'water', 'leak', 'drain', 'toilet', 'sink'],
    'Gardening': ['garden', 'plant', 'lawn', 'grass', 'tree', 'flower'],
    'Repair': ['repair', 'fix', 'broken', 'maintenance', 'service'],
    'Moving': ['move', 'relocat', 'transport', 'shifting', 'pack']
  };

  const categoryCount: { [key: string]: number } = {};

  queries.forEach(query => {
    Object.entries(categories).forEach(([category, keywords]) => {
      if (keywords.some(keyword => query.includes(keyword))) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });
  });

  return Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}