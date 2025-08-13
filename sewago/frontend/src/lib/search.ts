
import { featureFlags } from './feature-flags';

export interface SearchFilters {
  query?: string;
  serviceCategory?: string;
  city?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  earliestSlot?: Date;
  verifiedProvidersOnly?: boolean;
  rating?: number;
  availability?: 'today' | 'tomorrow' | 'this_week';
}

export interface SearchResult {
  id: string;
  name: string;
  category: string;
  city: string;
  basePrice: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  nextAvailableSlot: Date;
  distance?: number;
  relevanceScore: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  suggestions: string[];
  appliedFilters: SearchFilters;
  searchTime: number;
}

export class SearchEngine {
  private services: SearchResult[] = [
    {
      id: 'house-cleaning',
      name: 'Professional House Cleaning',
      category: 'cleaning',
      city: 'kathmandu',
      basePrice: 1500,
      rating: 4.8,
      reviewCount: 245,
      verified: true,
      nextAvailableSlot: new Date(Date.now() + 2 * 60 * 60 * 1000),
      relevanceScore: 0.95
    },
    {
      id: 'electrical-work',
      name: 'Electrical Repairs & Installation',
      category: 'repairs',
      city: 'kathmandu',
      basePrice: 2000,
      rating: 4.6,
      reviewCount: 189,
      verified: true,
      nextAvailableSlot: new Date(Date.now() + 4 * 60 * 60 * 1000),
      relevanceScore: 0.87
    }
  ];

  private searchHistory: Map<string, string[]> = new Map();
  private popularSearches = ['house cleaning', 'electrical work', 'plumbing', 'gardening'];

  async search(filters: SearchFilters, userId?: string): Promise<SearchResponse> {
    if (!featureFlags.SEARCH_ENABLED) {
      return {
        results: [],
        totalCount: 0,
        suggestions: [],
        appliedFilters: filters,
        searchTime: 0
      };
    }

    const startTime = Date.now();
    
    let results = [...this.services];

    // Apply filters
    results = this.applyFilters(results, filters);
    
    // Sort by relevance and other factors
    results = this.sortResults(results, filters);

    // Record search for analytics
    if (userId && filters.query) {
      this.recordSearch(userId, filters.query);
    }

    const searchTime = Date.now() - startTime;

    return {
      results,
      totalCount: results.length,
      suggestions: this.generateSuggestions(filters.query),
      appliedFilters: filters,
      searchTime
    };
  }

  private applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    let filtered = results;

    if (filters.query) {
      const queryLower = filters.query.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(queryLower) ||
        service.category.toLowerCase().includes(queryLower)
      );
    }

    if (filters.serviceCategory) {
      filtered = filtered.filter(service => 
        service.category === filters.serviceCategory
      );
    }

    if (filters.city) {
      filtered = filtered.filter(service => 
        service.city === filters.city
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(service => 
        service.basePrice >= filters.priceRange!.min &&
        service.basePrice <= filters.priceRange!.max
      );
    }

    if (filters.verifiedProvidersOnly) {
      filtered = filtered.filter(service => service.verified);
    }

    if (filters.rating) {
      filtered = filtered.filter(service => service.rating >= filters.rating!);
    }

    if (filters.earliestSlot) {
      filtered = filtered.filter(service => 
        service.nextAvailableSlot <= filters.earliestSlot!
      );
    }

    if (filters.availability) {
      const now = new Date();
      let cutoffTime: Date;

      switch (filters.availability) {
        case 'today':
          cutoffTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          break;
        case 'tomorrow':
          cutoffTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59);
          break;
        case 'this_week':
          cutoffTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }

      filtered = filtered.filter(service => 
        service.nextAvailableSlot <= cutoffTime
      );
    }

    return filtered;
  }

  private sortResults(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    return results.sort((a, b) => {
      // Primary: relevance score
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }

      // Secondary: rating and review count
      const aScore = a.rating * Math.log(a.reviewCount + 1);
      const bScore = b.rating * Math.log(b.reviewCount + 1);
      
      if (aScore !== bScore) {
        return bScore - aScore;
      }

      // Tertiary: verified providers
      if (a.verified !== b.verified) {
        return a.verified ? -1 : 1;
      }

      // Quaternary: earliest availability
      return a.nextAvailableSlot.getTime() - b.nextAvailableSlot.getTime();
    });
  }

  generateSuggestions(query?: string): string[] {
    if (!query) {
      return this.popularSearches.slice(0, 5);
    }

    const queryLower = query.toLowerCase();
    const suggestions = [];

    // Add partial matches from services
    for (const service of this.services) {
      if (service.name.toLowerCase().includes(queryLower)) {
        suggestions.push(service.name);
      }
    }

    // Add popular searches that match
    for (const popular of this.popularSearches) {
      if (popular.toLowerCase().includes(queryLower)) {
        suggestions.push(popular);
      }
    }

    return [...new Set(suggestions)].slice(0, 5);
  }

  private recordSearch(userId: string, query: string) {
    if (!this.searchHistory.has(userId)) {
      this.searchHistory.set(userId, []);
    }
    
    const userHistory = this.searchHistory.get(userId)!;
    userHistory.unshift(query);
    
    // Keep only last 50 searches
    if (userHistory.length > 50) {
      userHistory.splice(50);
    }
  }

  async getSearchAnalytics(userId?: string) {
    if (userId) {
      return {
        recentSearches: this.searchHistory.get(userId)?.slice(0, 10) || [],
        personalizedSuggestions: this.generatePersonalizedSuggestions(userId)
      };
    }

    return {
      popularSearches: this.popularSearches,
      totalSearches: Array.from(this.searchHistory.values()).reduce((acc, searches) => acc + searches.length, 0)
    };
  }

  private generatePersonalizedSuggestions(userId: string): string[] {
    const userHistory = this.searchHistory.get(userId);
    if (!userHistory) return this.popularSearches.slice(0, 3);

    // Find most common categories/terms from user's search history
    const termCounts = new Map<string, number>();
    
    for (const search of userHistory) {
      const terms = search.toLowerCase().split(' ');
      for (const term of terms) {
        termCounts.set(term, (termCounts.get(term) || 0) + 1);
      }
    }

    const sortedTerms = Array.from(termCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([term]) => term);

    return sortedTerms;
  }
}

export const searchEngine = new SearchEngine();
