import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RecommendationContext {
  userId: string;
  location?: { lat: number; lng: number; area?: string };
  timeOfDay?: string;
  season?: string;
  deviceType?: string;
  currentCategory?: string;
}

export interface ServiceRecommendation {
  serviceId: string;
  score: number;
  reason: string;
  algorithm: 'collaborative' | 'content' | 'location' | 'hybrid';
  metadata?: Record<string, any>;
}

export interface ProviderRecommendation {
  providerId: string;
  score: number;
  reason: string;
  matchFactors: string[];
}

export class RecommendationEngine {
  private static instance: RecommendationEngine;
  
  static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine();
    }
    return RecommendationEngine.instance;
  }

  /**
   * Get personalized service recommendations for a user
   */
  async getServiceRecommendations(
    context: RecommendationContext,
    limit = 10
  ): Promise<ServiceRecommendation[]> {
    const recommendations: ServiceRecommendation[] = [];

    // Get user preferences and insights
    const [preferences, insights, userBehavior] = await Promise.all([
      this.getUserPreferences(context.userId),
      this.getUserInsights(context.userId),
      this.getRecentUserBehavior(context.userId, 30) // Last 30 days
    ]);

    // 1. Collaborative Filtering - Users with similar preferences
    const collaborativeRecs = await this.getCollaborativeRecommendations(
      context,
      preferences,
      insights,
      Math.ceil(limit * 0.4)
    );
    recommendations.push(...collaborativeRecs);

    // 2. Content-Based Filtering - Similar services to user's history
    const contentRecs = await this.getContentBasedRecommendations(
      context,
      userBehavior,
      preferences,
      Math.ceil(limit * 0.3)
    );
    recommendations.push(...contentRecs);

    // 3. Location-Based Recommendations
    const locationRecs = await this.getLocationBasedRecommendations(
      context,
      Math.ceil(limit * 0.2)
    );
    recommendations.push(...locationRecs);

    // 4. Seasonal/Cultural Recommendations
    const seasonalRecs = await this.getSeasonalRecommendations(
      context,
      preferences,
      Math.ceil(limit * 0.1)
    );
    recommendations.push(...seasonalRecs);

    // Remove duplicates and sort by score
    const uniqueRecs = this.deduplicateRecommendations(recommendations);
    const finalRecs = uniqueRecs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Log recommendations for analysis
    await this.logRecommendations(context.userId, finalRecs, context);

    return finalRecs;
  }

  /**
   * Get provider recommendations for a specific service
   */
  async getProviderRecommendations(
    context: RecommendationContext,
    serviceId: string,
    limit = 5
  ): Promise<ProviderRecommendation[]> {
    const [preferences, insights] = await Promise.all([
      this.getUserPreferences(context.userId),
      this.getUserInsights(context.userId)
    ]);

    // Get providers for this service
    const providers = await prisma.provider.findMany({
      where: {
        isOnline: true,
        verified: true
      },
      include: {
        bookings: {
          include: {
            review: true
          }
        }
      }
    });

    const recommendations: ProviderRecommendation[] = [];

    for (const provider of providers) {
      const score = await this.calculateProviderScore(
        provider,
        context,
        preferences,
        insights
      );
      
      if (score > 0.3) { // Minimum threshold
        recommendations.push({
          providerId: provider.id,
          score,
          reason: this.generateProviderReason(provider, score),
          matchFactors: this.getProviderMatchFactors(provider, preferences, insights)
        });
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Collaborative Filtering - Find users with similar preferences
   */
  private async getCollaborativeRecommendations(
    context: RecommendationContext,
    preferences: any,
    insights: any,
    limit: number
  ): Promise<ServiceRecommendation[]> {
    // Find similar users based on booking patterns and preferences
    const similarUsers = await this.findSimilarUsers(context.userId, preferences, insights);
    
    if (similarUsers.length === 0) {
      return [];
    }

    // Get services booked by similar users that current user hasn't booked
    const userBookedServices = await this.getUserBookedServices(context.userId);
    
    const serviceScores = new Map<string, number>();
    const serviceReasons = new Map<string, string>();

    for (const similarUser of similarUsers) {
      const similarUserBookings = await prisma.booking.findMany({
        where: {
          userId: similarUser.userId,
          status: 'COMPLETED',
          serviceId: { notIn: userBookedServices }
        },
        include: { service: true, review: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      for (const booking of similarUserBookings) {
        const currentScore = serviceScores.get(booking.serviceId) || 0;
        const similarity = similarUser.similarity;
        const reviewBonus = booking.review?.rating ? (booking.review.rating / 5) * 0.2 : 0;
        
        const newScore = currentScore + (similarity * 0.8) + reviewBonus;
        serviceScores.set(booking.serviceId, newScore);
        
        if (!serviceReasons.has(booking.serviceId)) {
          serviceReasons.set(
            booking.serviceId, 
            `Users with similar preferences also booked this service`
          );
        }
      }
    }

    // Convert to recommendations
    const recommendations: ServiceRecommendation[] = [];
    for (const [serviceId, score] of serviceScores.entries()) {
      recommendations.push({
        serviceId,
        score: Math.min(score, 1.0), // Cap at 1.0
        reason: serviceReasons.get(serviceId) || 'Popular with similar users',
        algorithm: 'collaborative'
      });
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Content-Based Filtering - Recommend based on service attributes
   */
  private async getContentBasedRecommendations(
    context: RecommendationContext,
    userBehavior: any[],
    preferences: any,
    limit: number
  ): Promise<ServiceRecommendation[]> {
    if (!preferences?.preferredCategories?.length && userBehavior.length === 0) {
      return [];
    }

    // Get user's preferred categories from preferences or behavior
    const categories = preferences?.preferredCategories || 
      [...new Set(userBehavior.map(b => b.category).filter(Boolean))];

    if (categories.length === 0) {
      return [];
    }

    // Get user's booked services to exclude
    const userBookedServices = await this.getUserBookedServices(context.userId);

    // Find services in preferred categories
    const services = await prisma.service.findMany({
      where: {
        category: { in: categories },
        isActive: true,
        id: { notIn: userBookedServices }
      },
      include: {
        reviews: true,
        bookings: true
      },
      take: limit * 2 // Get more to filter
    });

    const recommendations: ServiceRecommendation[] = [];

    for (const service of services) {
      let score = 0;

      // Category preference score
      if (preferences?.preferredCategories?.includes(service.category)) {
        score += 0.4;
      }

      // Price preference score
      if (preferences?.budgetRange) {
        const { min, max } = preferences.budgetRange;
        if (service.basePrice >= min && service.basePrice <= max) {
          score += 0.3;
        } else if (service.basePrice < max * 1.2) { // Slightly over budget
          score += 0.1;
        }
      }

      // Rating and popularity score
      const avgRating = service.reviews.length > 0 
        ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length
        : 0;
      score += (avgRating / 5) * 0.2;

      // Popularity score
      const popularityScore = Math.min(service.bookings.length / 100, 0.1);
      score += popularityScore;

      if (score > 0.3) {
        recommendations.push({
          serviceId: service.id,
          score: Math.min(score, 1.0),
          reason: `Matches your preference for ${service.category} services`,
          algorithm: 'content',
          metadata: {
            category: service.category,
            avgRating,
            bookingCount: service.bookings.length
          }
        });
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Location-Based Recommendations
   */
  private async getLocationBasedRecommendations(
    context: RecommendationContext,
    limit: number
  ): Promise<ServiceRecommendation[]> {
    if (!context.location?.area) {
      return [];
    }

    // Get location insights for user's area
    const locationInsights = await prisma.locationInsights.findUnique({
      where: { area: context.location.area }
    });

    if (!locationInsights?.popularServices?.length) {
      return [];
    }

    // Get user's booked services to exclude
    const userBookedServices = await this.getUserBookedServices(context.userId);

    // Find popular services in user's area
    const services = await prisma.service.findMany({
      where: {
        category: { in: locationInsights.popularServices },
        city: context.location.area,
        isActive: true,
        id: { notIn: userBookedServices }
      },
      include: {
        reviews: true,
        bookings: {
          where: {
            status: 'COMPLETED'
          }
        }
      },
      take: limit * 2
    });

    const recommendations: ServiceRecommendation[] = [];

    for (const service of services) {
      const popularityIndex = locationInsights.popularServices.indexOf(service.category);
      const popularityScore = (locationInsights.popularServices.length - popularityIndex) / 
        locationInsights.popularServices.length;

      const avgRating = service.reviews.length > 0 
        ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length
        : 0;

      const score = (popularityScore * 0.6) + ((avgRating / 5) * 0.4);

      if (score > 0.3) {
        recommendations.push({
          serviceId: service.id,
          score: Math.min(score, 1.0),
          reason: `Popular in ${context.location.area}`,
          algorithm: 'location',
          metadata: {
            area: context.location.area,
            localPopularity: popularityScore,
            avgRating
          }
        });
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Seasonal/Cultural Recommendations
   */
  private async getSeasonalRecommendations(
    context: RecommendationContext,
    preferences: any,
    limit: number
  ): Promise<ServiceRecommendation[]> {
    const currentMonth = new Date().getMonth() + 1;
    const currentSeason = this.getCurrentSeason(currentMonth);
    
    // Get seasonal service mappings
    const seasonalServices = this.getSeasonalServiceMappings();
    const currentSeasonServices = seasonalServices[currentSeason] || [];

    if (currentSeasonServices.length === 0) {
      return [];
    }

    // Check for Nepali festivals
    const currentFestival = this.getCurrentNepaliEvent();
    let festivalServices: string[] = [];
    
    if (currentFestival) {
      festivalServices = this.getFestivalServices(currentFestival);
    }

    // Combine seasonal and festival services
    const allSeasonalServices = [...currentSeasonServices, ...festivalServices];
    
    if (allSeasonalServices.length === 0) {
      return [];
    }

    // Get user's booked services to exclude
    const userBookedServices = await this.getUserBookedServices(context.userId);

    const services = await prisma.service.findMany({
      where: {
        category: { in: allSeasonalServices },
        isActive: true,
        id: { notIn: userBookedServices }
      },
      include: {
        reviews: true
      },
      take: limit * 2
    });

    const recommendations: ServiceRecommendation[] = [];

    for (const service of services) {
      let score = 0.5; // Base seasonal score

      // Festival bonus
      if (currentFestival && festivalServices.includes(service.category)) {
        score += 0.3;
      }

      // Cultural preference bonus
      if (preferences?.culturalPreferences?.festivals?.includes(currentFestival)) {
        score += 0.2;
      }

      // Rating bonus
      const avgRating = service.reviews.length > 0 
        ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length
        : 0;
      score += (avgRating / 5) * 0.2;

      const reason = currentFestival 
        ? `Perfect for ${currentFestival} celebrations`
        : `Great for ${currentSeason} season`;

      recommendations.push({
        serviceId: service.id,
        score: Math.min(score, 1.0),
        reason,
        algorithm: 'content',
        metadata: {
          season: currentSeason,
          festival: currentFestival,
          avgRating
        }
      });
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Helper Methods

  private async getUserPreferences(userId: string) {
    return await prisma.userPreferences.findUnique({
      where: { userId }
    });
  }

  private async getUserInsights(userId: string) {
    return await prisma.personalizationInsights.findUnique({
      where: { userId }
    });
  }

  private async getRecentUserBehavior(userId: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    return await prisma.userBehavior.findMany({
      where: {
        userId,
        timestamp: { gte: since }
      },
      orderBy: { timestamp: 'desc' }
    });
  }

  private async getUserBookedServices(userId: string): Promise<string[]> {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      select: { serviceId: true }
    });
    return bookings.map(b => b.serviceId);
  }

  private async findSimilarUsers(
    userId: string, 
    preferences: any, 
    insights: any
  ): Promise<Array<{ userId: string; similarity: number }>> {
    // Simplified similarity calculation
    // In a real implementation, you'd use more sophisticated ML algorithms
    
    const allUsers = await prisma.personalizationInsights.findMany({
      where: {
        userId: { not: userId }
      }
    });

    const similarities: Array<{ userId: string; similarity: number }> = [];

    for (const user of allUsers) {
      let similarity = 0;

      // Category similarity
      if (insights?.topCategories && user.topCategories) {
        const intersection = insights.topCategories.filter(
          (cat: string) => user.topCategories.includes(cat)
        );
        similarity += (intersection.length / Math.max(insights.topCategories.length, user.topCategories.length)) * 0.4;
      }

      // Spending similarity
      if (insights?.averageSpending && user.averageSpending) {
        const spendingDiff = Math.abs(insights.averageSpending - user.averageSpending);
        const maxSpending = Math.max(insights.averageSpending, user.averageSpending);
        const spendingSimilarity = 1 - (spendingDiff / maxSpending);
        similarity += spendingSimilarity * 0.3;
      }

      // Time pattern similarity
      if (insights?.mostBookedTimes && user.mostBookedTimes) {
        const timeIntersection = insights.mostBookedTimes.filter(
          (time: string) => user.mostBookedTimes.includes(time)
        );
        similarity += (timeIntersection.length / Math.max(insights.mostBookedTimes.length, user.mostBookedTimes.length)) * 0.3;
      }

      if (similarity > 0.3) {
        similarities.push({ userId: user.userId, similarity });
      }
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10); // Top 10 similar users
  }

  private async calculateProviderScore(
    provider: any,
    context: RecommendationContext,
    preferences: any,
    insights: any
  ): Promise<number> {
    let score = 0;

    // Base reliability score
    score += (provider.onTimePct / 100) * 0.3;
    score += (provider.completionPct / 100) * 0.3;

    // Experience score
    score += Math.min(provider.yearsActive / 5, 1) * 0.2;

    // User preference score
    if (preferences?.preferredProviders?.includes(provider.id)) {
      score += 0.3;
    }

    // Location proximity (if available)
    if (context.location && provider.currentLat && provider.currentLng) {
      const distance = this.calculateDistance(
        context.location.lat,
        context.location.lng,
        provider.currentLat,
        provider.currentLng
      );
      
      // Closer providers get higher score
      const proximityScore = Math.max(0, 1 - (distance / 10)); // 10km max range
      score += proximityScore * 0.1;
    }

    // Review score
    if (provider.bookings?.length > 0) {
      const reviewedBookings = provider.bookings.filter((b: any) => b.review);
      if (reviewedBookings.length > 0) {
        const avgRating = reviewedBookings.reduce(
          (sum: number, b: any) => sum + b.review.rating, 0
        ) / reviewedBookings.length;
        score += (avgRating / 5) * 0.2;
      }
    }

    return Math.min(score, 1.0);
  }

  private generateProviderReason(provider: any, score: number): string {
    const reasons = [];
    
    if (provider.onTimePct >= 90) reasons.push('highly punctual');
    if (provider.completionPct >= 95) reasons.push('excellent completion rate');
    if (provider.yearsActive >= 3) reasons.push('experienced');
    if (provider.verified) reasons.push('verified provider');

    return reasons.length > 0 
      ? `Recommended: ${reasons.join(', ')}`
      : 'Good match for your needs';
  }

  private getProviderMatchFactors(provider: any, preferences: any, insights: any): string[] {
    const factors = [];
    
    if (provider.onTimePct >= 90) factors.push('Punctual');
    if (provider.completionPct >= 95) factors.push('Reliable');
    if (provider.yearsActive >= 3) factors.push('Experienced');
    if (provider.verified) factors.push('Verified');
    if (preferences?.preferredProviders?.includes(provider.id)) factors.push('Previous Choice');
    
    return factors;
  }

  private deduplicateRecommendations(recommendations: ServiceRecommendation[]): ServiceRecommendation[] {
    const seen = new Set<string>();
    return recommendations.filter(rec => {
      if (seen.has(rec.serviceId)) {
        return false;
      }
      seen.add(rec.serviceId);
      return true;
    });
  }

  private async logRecommendations(
    userId: string,
    recommendations: ServiceRecommendation[],
    context: RecommendationContext
  ): Promise<void> {
    try {
      await prisma.recommendationLog.create({
        data: {
          userId,
          algorithm: 'hybrid',
          recommendations: recommendations.map(r => ({
            serviceId: r.serviceId,
            score: r.score,
            reason: r.reason,
            algorithm: r.algorithm
          })),
          context: {
            location: context.location,
            timeOfDay: context.timeOfDay,
            season: context.season,
            deviceType: context.deviceType,
            currentCategory: context.currentCategory
          }
        }
      });
    } catch (error) {
      console.error('Failed to log recommendations:', error);
    }
  }

  private getCurrentSeason(month: number): string {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  private getCurrentNepaliEvent(): string | null {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    // Simplified Nepali festival calendar (approximate dates)
    const festivals = [
      { name: 'Dashain', months: [9, 10], description: 'Major Hindu festival' },
      { name: 'Tihar', months: [10, 11], description: 'Festival of lights' },
      { name: 'Holi', months: [3, 4], description: 'Festival of colors' },
      { name: 'Buddha Jayanti', months: [4, 5], description: 'Buddha\'s birthday' },
      { name: 'New Year', months: [4], description: 'Nepali New Year' }
    ];

    for (const festival of festivals) {
      if (festival.months.includes(month)) {
        return festival.name;
      }
    }

    return null;
  }

  private getSeasonalServiceMappings(): Record<string, string[]> {
    return {
      spring: ['Cleaning', 'Gardening', 'Renovation', 'Painting'],
      summer: ['AC Repair', 'Plumbing', 'Electrical', 'Home Maintenance'],
      monsoon: ['Waterproofing', 'Drainage', 'Roof Repair', 'Electrical Safety'],
      autumn: ['Home Cleaning', 'Furniture Repair', 'Interior Design'],
      winter: ['Heating Repair', 'Insulation', 'Home Security', 'Appliance Maintenance']
    };
  }

  private getFestivalServices(festival: string): string[] {
    const festivalServices: Record<string, string[]> = {
      'Dashain': ['Deep Cleaning', 'Home Decoration', 'Cooking', 'Laundry'],
      'Tihar': ['Electrical', 'Decoration', 'Cleaning', 'Gardening'],
      'Holi': ['Cleaning', 'Laundry', 'Painting', 'Home Maintenance'],
      'New Year': ['Deep Cleaning', 'Home Organization', 'Decoration', 'Renovation']
    };

    return festivalServices[festival] || [];
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export const recommendationEngine = RecommendationEngine.getInstance();