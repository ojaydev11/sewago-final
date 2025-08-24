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
    const { query, userId, location, sessionId, category } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Record search behavior
    if (sessionId) {
      await prisma.searchBehavior.create({
        data: {
          userId: userId || null,
          query: query.trim(),
          resultClicks: [],
          sessionId,
          location,
          deviceType: request.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop',
          resultCount: 0,
        }
      });
    }

    // Get cached predictions
    const cachedSearch = await prisma.smartSearchCache.findFirst({
      where: {
        query: {
          contains: query.trim(),
          mode: 'insensitive'
        }
      },
      orderBy: {
        popularity: 'desc'
      }
    });

    // Generate AI predictions based on query
    const predictions = await generateSearchPredictions(query, location, category, userId);

    // Get popular searches
    const popularSearches = await getPopularSearches(location, category);

    // Get typo corrections
    const corrections = await getTypoCorrections(query);

    // Update or create cache entry
    if (cachedSearch) {
      await prisma.smartSearchCache.update({
        where: { id: cachedSearch.id },
        data: {
          popularity: cachedSearch.popularity + 1,
          predictions: predictions.slice(0, 10),
        }
      });
    } else {
      await prisma.smartSearchCache.create({
        data: {
          query: query.trim(),
          predictions: predictions.slice(0, 10),
          location: location?.city || null,
          category: category || null,
        }
      });
    }

    return NextResponse.json({
      predictions: predictions.slice(0, 8),
      popularSearches: popularSearches.slice(0, 5),
      corrections,
      sessionId
    });

  } catch (error) {
    console.error('Search prediction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateSearchPredictions(
  query: string, 
  location: any, 
  category: string | null, 
  userId: string | null
) {
  const queryLower = query.toLowerCase().trim();
  
  // Get services matching the query
  const services = await prisma.service.findMany({
    where: {
      OR: [
        {
          name: {
            contains: queryLower,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: queryLower,
            mode: 'insensitive'
          }
        },
        {
          category: {
            contains: queryLower,
            mode: 'insensitive'
          }
        }
      ],
      isActive: true,
      ...(location?.city && { city: location.city }),
      ...(category && { category })
    },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      basePrice: true,
      city: true,
      slug: true,
      imageUrl: true
    },
    orderBy: [
      { name: 'asc' }
    ],
    take: 15
  });

  // Get user's previous searches for personalization
  let userSearchHistory: any[] = [];
  if (userId) {
    userSearchHistory = await prisma.searchBehavior.findMany({
      where: {
        userId,
        query: {
          not: queryLower
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10
    });
  }

  // Create predictions with scoring
  const predictions = services.map(service => ({
    type: 'service',
    id: service.id,
    title: service.name,
    description: service.description,
    category: service.category,
    price: service.basePrice,
    city: service.city,
    slug: service.slug,
    imageUrl: service.imageUrl,
    score: calculateRelevanceScore(service, query, userSearchHistory),
    searchType: 'exact_match'
  }));

  // Add category suggestions
  const categories = await prisma.service.groupBy({
    by: ['category'],
    where: {
      isActive: true,
      ...(location?.city && { city: location.city }),
      category: {
        contains: queryLower,
        mode: 'insensitive'
      }
    },
    _count: {
      category: true
    },
    orderBy: {
      _count: {
        category: 'desc'
      }
    },
    take: 5
  });

  const categoryPredictions = categories.map(cat => ({
    type: 'category',
    id: cat.category,
    title: cat.category,
    description: `Browse all ${cat.category.toLowerCase()} services`,
    category: cat.category,
    score: 0.8,
    searchType: 'category',
    count: cat._count.category
  }));

  // Combine and sort by score
  const allPredictions = [...predictions, ...categoryPredictions]
    .sort((a, b) => b.score - a.score);

  return allPredictions;
}

function calculateRelevanceScore(
  service: any, 
  query: string, 
  userHistory: any[]
): number {
  let score = 0;
  const queryLower = query.toLowerCase();

  // Exact name match
  if (service.name.toLowerCase().includes(queryLower)) {
    score += 1.0;
  }

  // Description match
  if (service.description.toLowerCase().includes(queryLower)) {
    score += 0.6;
  }

  // Category match
  if (service.category.toLowerCase().includes(queryLower)) {
    score += 0.8;
  }

  // User history boost
  const userCategoryHistory = userHistory.filter(h => 
    h.query.toLowerCase().includes(service.category.toLowerCase())
  );
  if (userCategoryHistory.length > 0) {
    score += 0.3 * Math.min(userCategoryHistory.length, 3);
  }

  return score;
}

async function getPopularSearches(location: any, category: string | null) {
  const whereClause: any = {
    timestamp: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    }
  };

  if (location?.city) {
    whereClause.location = {
      path: ['city'],
      equals: location.city
    };
  }

  const popularSearches = await prisma.searchBehavior.groupBy({
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

  return popularSearches.map(search => ({
    query: search.query,
    count: search._count.query,
    type: 'popular'
  }));
}

async function getTypoCorrections(query: string) {
  // Simple typo correction logic
  const commonTypos = {
    'plumbing': ['plumming', 'plumbing', 'plumbig'],
    'cleaning': ['cleening', 'clening', 'cleaning'],
    'electrical': ['electical', 'electrical', 'electrik'],
    'gardening': ['gardning', 'gardeing', 'gardening'],
    'repair': ['repai', 'repar', 'repair']
  };

  const queryLower = query.toLowerCase();
  
  for (const [correct, typos] of Object.entries(commonTypos)) {
    for (const typo of typos) {
      if (queryLower.includes(typo) && typo !== correct) {
        return {
          original: query,
          corrected: query.replace(new RegExp(typo, 'gi'), correct),
          confidence: 0.8
        };
      }
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    // Quick autocomplete suggestions
    const suggestions = await prisma.service.findMany({
      where: {
        OR: [
          {
            name: {
              startsWith: query,
              mode: 'insensitive'
            }
          },
          {
            category: {
              startsWith: query,
              mode: 'insensitive'
            }
          }
        ],
        isActive: true
      },
      select: {
        name: true,
        category: true
      },
      take: 8
    });

    const autocompleteSuggestions = [
      ...new Set([
        ...suggestions.map(s => s.name),
        ...suggestions.map(s => s.category)
      ])
    ].slice(0, 6);

    return NextResponse.json({
      suggestions: autocompleteSuggestions
    });

  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}