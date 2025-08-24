import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const location = searchParams.get('location');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '8');

    if (!query || query.trim().length < 1) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = await generateAutocompleteSuggestions(
      query.trim(),
      location,
      userId,
      limit
    );

    return NextResponse.json({
      query: query.trim(),
      suggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateAutocompleteSuggestions(
  query: string,
  location: string | null,
  userId: string | null,
  limit: number
) {
  const queryLower = query.toLowerCase();
  
  // Get service-based suggestions
  const serviceSuggestions = await getServiceSuggestions(queryLower, location, limit);
  
  // Get category suggestions
  const categorySuggestions = await getCategorySuggestions(queryLower, location);
  
  // Get popular search suggestions
  const popularSuggestions = await getPopularSearchSuggestions(queryLower, location);
  
  // Get personalized suggestions if user is logged in
  const personalizedSuggestions = userId 
    ? await getPersonalizedSuggestions(queryLower, userId, location)
    : [];

  // Combine all suggestions and rank them
  const allSuggestions = [
    ...serviceSuggestions,
    ...categorySuggestions,
    ...popularSuggestions,
    ...personalizedSuggestions
  ];

  // Remove duplicates and rank by relevance
  const uniqueSuggestions = removeDuplicatesAndRank(allSuggestions, queryLower);
  
  return uniqueSuggestions.slice(0, limit);
}

async function getServiceSuggestions(query: string, location: string | null, limit: number) {
  const whereClause: any = {
    isActive: true,
    OR: [
      {
        name: {
          startsWith: query,
          mode: 'insensitive'
        }
      },
      {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      {
        description: {
          contains: query,
          mode: 'insensitive'
        }
      }
    ]
  };

  if (location) {
    whereClause.city = {
      equals: location,
      mode: 'insensitive'
    };
  }

  const services = await prisma.service.findMany({
    where: whereClause,
    select: {
      name: true,
      category: true,
      basePrice: true,
      city: true,
      slug: true
    },
    orderBy: [
      {
        name: 'asc'
      }
    ],
    take: limit
  });

  return services.map(service => ({
    text: service.name,
    type: 'service',
    category: service.category,
    price: service.basePrice,
    city: service.city,
    slug: service.slug,
    score: calculateServiceRelevanceScore(service.name, query),
    icon: getServiceIcon(service.category)
  }));
}

async function getCategorySuggestions(query: string, location: string | null) {
  const whereClause: any = {
    isActive: true,
    category: {
      contains: query,
      mode: 'insensitive'
    }
  };

  if (location) {
    whereClause.city = {
      equals: location,
      mode: 'insensitive'
    };
  }

  const categories = await prisma.service.groupBy({
    by: ['category'],
    where: whereClause,
    _count: {
      category: true
    },
    orderBy: {
      _count: {
        category: 'desc'
      }
    },
    take: 3
  });

  return categories.map(cat => ({
    text: cat.category,
    type: 'category',
    category: cat.category,
    count: cat._count.category,
    score: calculateCategoryRelevanceScore(cat.category, query),
    icon: getCategoryIcon(cat.category)
  }));
}

async function getPopularSearchSuggestions(query: string, location: string | null) {
  const whereClause: any = {
    query: {
      startsWith: query,
      mode: 'insensitive'
    },
    timestamp: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    }
  };

  if (location) {
    whereClause.location = {
      path: ['city'],
      equals: location
    };
  }

  const popularSearches = await prisma.searchBehavior.groupBy({
    by: ['query'],
    where: whereClause,
    _count: {
      query: true
    },
    having: {
      query: {
        _count: {
          gte: 2
        }
      }
    },
    orderBy: {
      _count: {
        query: 'desc'
      }
    },
    take: 5
  });

  return popularSearches.map(search => ({
    text: search.query,
    type: 'popular',
    count: search._count.query,
    score: 0.7,
    icon: 'trending'
  }));
}

async function getPersonalizedSuggestions(
  query: string, 
  userId: string, 
  location: string | null
) {
  // Get user's search history
  const userSearchHistory = await prisma.searchBehavior.findMany({
    where: {
      userId,
      query: {
        startsWith: query,
        mode: 'insensitive'
      },
      timestamp: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
      }
    },
    select: {
      query: true
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: 5,
    distinct: ['query']
  });

  // Get user preferences
  const userPreferences = await prisma.userPreferences.findUnique({
    where: { userId },
    select: {
      preferredCategories: true,
      personalizedSettings: true
    }
  });

  const suggestions = userSearchHistory.map(search => ({
    text: search.query,
    type: 'personal',
    score: 0.9,
    icon: 'history'
  }));

  // Add category-based personalized suggestions
  if (userPreferences?.preferredCategories) {
    const categoryBasedServices = await prisma.service.findMany({
      where: {
        isActive: true,
        category: {
          in: userPreferences.preferredCategories
        },
        name: {
          startsWith: query,
          mode: 'insensitive'
        },
        ...(location && { city: location })
      },
      select: {
        name: true,
        category: true
      },
      take: 3
    });

    const categoryBasedSuggestions = categoryBasedServices.map(service => ({
      text: service.name,
      type: 'personalized_service',
      category: service.category,
      score: 0.85,
      icon: getServiceIcon(service.category)
    }));

    suggestions.push(...categoryBasedSuggestions);
  }

  return suggestions;
}

function removeDuplicatesAndRank(suggestions: any[], query: string) {
  // Remove duplicates based on text
  const uniqueMap = new Map();
  
  suggestions.forEach(suggestion => {
    const key = suggestion.text.toLowerCase();
    if (!uniqueMap.has(key) || uniqueMap.get(key).score < suggestion.score) {
      uniqueMap.set(key, suggestion);
    }
  });

  // Convert back to array and sort by score
  return Array.from(uniqueMap.values())
    .sort((a, b) => b.score - a.score);
}

function calculateServiceRelevanceScore(serviceName: string, query: string): number {
  const serviceNameLower = serviceName.toLowerCase();
  const queryLower = query.toLowerCase();

  if (serviceNameLower.startsWith(queryLower)) {
    return 1.0;
  } else if (serviceNameLower.includes(queryLower)) {
    return 0.8;
  } else {
    // Use Levenshtein distance for fuzzy matching
    const distance = levenshteinDistance(queryLower, serviceNameLower);
    const maxLength = Math.max(queryLower.length, serviceNameLower.length);
    return Math.max(0, 1 - (distance / maxLength));
  }
}

function calculateCategoryRelevanceScore(category: string, query: string): number {
  const categoryLower = category.toLowerCase();
  const queryLower = query.toLowerCase();

  if (categoryLower.startsWith(queryLower)) {
    return 0.9;
  } else if (categoryLower.includes(queryLower)) {
    return 0.7;
  }
  return 0.5;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j += 1) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
}

function getServiceIcon(category: string): string {
  const iconMap: { [key: string]: string } = {
    'Cleaning': 'clean_hands',
    'House Cleaning': 'clean_hands',
    'Electrical': 'electrical_services',
    'Electrical Work': 'electrical_services',
    'Plumbing': 'plumbing',
    'Gardening': 'yard',
    'Garden Care': 'yard',
    'Repair': 'build',
    'Home Repair': 'build',
    'Moving': 'local_shipping',
    'Relocation': 'local_shipping'
  };

  return iconMap[category] || 'home_repair_service';
}

function getCategoryIcon(category: string): string {
  return getServiceIcon(category);
}