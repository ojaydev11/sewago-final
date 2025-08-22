import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface BehaviorEvent {
  userId: string;
  action: 'view' | 'book' | 'complete' | 'review' | 'search' | 'click' | 'like' | 'share';
  serviceId?: string;
  providerId?: string;
  category?: string;
  timeSpent?: number;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  location?: {
    lat: number;
    lng: number;
    area?: string;
    district?: string;
  };
  searchQuery?: string;
  clickTarget?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface UserInsights {
  topCategories: string[];
  mostBookedTimes: string[];
  averageSpending: number;
  locationHotspots: Array<{
    area: string;
    frequency: number;
    services: string[];
  }>;
  seasonalPatterns: Record<string, string[]>;
  providerAffinities: string[];
  predictedNeeds: Array<{
    category: string;
    probability: number;
    reason: string;
  }>;
  personalityProfile: {
    priceConsciousness: 'low' | 'medium' | 'high';
    bookingFrequency: 'occasional' | 'regular' | 'frequent';
    categoryDiversity: 'focused' | 'moderate' | 'diverse';
    timePreference: 'morning' | 'afternoon' | 'evening' | 'flexible';
    planningStyle: 'spontaneous' | 'planned' | 'mixed';
  };
  bookingPatterns: {
    preferredDays: string[];
    preferredTimeSlots: string[];
    averageAdvanceBooking: number; // days
    seasonalActivity: Record<string, number>;
  };
}

export class BehaviorTracker {
  private static instance: BehaviorTracker;
  private sessionEvents: Map<string, BehaviorEvent[]> = new Map();
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds

  static getInstance(): BehaviorTracker {
    if (!BehaviorTracker.instance) {
      BehaviorTracker.instance = new BehaviorTracker();
      BehaviorTracker.instance.startPeriodicFlush();
    }
    return BehaviorTracker.instance;
  }

  /**
   * Track a user behavior event
   */
  async trackEvent(event: BehaviorEvent): Promise<void> {
    try {
      // Add to session buffer
      const sessionId = event.sessionId || 'default';
      if (!this.sessionEvents.has(sessionId)) {
        this.sessionEvents.set(sessionId, []);
      }
      
      this.sessionEvents.get(sessionId)!.push({
        ...event,
        sessionId
      });

      // Flush if batch size reached
      if (this.sessionEvents.get(sessionId)!.length >= this.BATCH_SIZE) {
        await this.flushSession(sessionId);
      }

      // Immediate processing for critical events
      if (this.isCriticalEvent(event.action)) {
        await this.processCriticalEvent(event);
      }
    } catch (error) {
      console.error('Failed to track behavior event:', error);
    }
  }

  /**
   * Track multiple events at once
   */
  async trackEvents(events: BehaviorEvent[]): Promise<void> {
    try {
      await prisma.userBehavior.createMany({
        data: events.map(event => ({
          userId: event.userId,
          action: event.action,
          serviceId: event.serviceId,
          providerId: event.providerId,
          category: event.category,
          timeSpent: event.timeSpent,
          deviceType: event.deviceType,
          location: event.location,
          searchQuery: event.searchQuery,
          clickTarget: event.clickTarget,
          sessionId: event.sessionId
        }))
      });

      // Update user insights for all affected users
      const userIds = [...new Set(events.map(e => e.userId))];
      for (const userId of userIds) {
        await this.updateUserInsights(userId);
      }
    } catch (error) {
      console.error('Failed to track behavior events:', error);
    }
  }

  /**
   * Get comprehensive user insights
   */
  async getUserInsights(userId: string): Promise<UserInsights | null> {
    try {
      const insights = await prisma.personalizationInsights.findUnique({
        where: { userId }
      });

      if (!insights) {
        // Generate insights if they don't exist
        await this.updateUserInsights(userId);
        return await this.getUserInsights(userId);
      }

      return {
        topCategories: insights.topCategories,
        mostBookedTimes: insights.mostBookedTimes,
        averageSpending: insights.averageSpending,
        locationHotspots: insights.locationHotspots as any[],
        seasonalPatterns: insights.seasonalPatterns as Record<string, string[]>,
        providerAffinities: insights.providerAffinities,
        predictedNeeds: insights.predictedNeeds as any[],
        personalityProfile: insights.personalityProfile as any,
        bookingPatterns: insights.bookingPatterns as any
      };
    } catch (error) {
      console.error('Failed to get user insights:', error);
      return null;
    }
  }

  /**
   * Update user insights based on recent behavior
   */
  async updateUserInsights(userId: string): Promise<void> {
    try {
      const [behaviors, bookings, preferences] = await Promise.all([
        this.getRecentBehaviors(userId, 90), // Last 90 days
        this.getUserBookings(userId),
        this.getUserPreferences(userId)
      ]);

      const insights = await this.calculateInsights(userId, behaviors, bookings, preferences);

      await prisma.personalizationInsights.upsert({
        where: { userId },
        update: insights,
        create: {
          userId,
          ...insights
        }
      });
    } catch (error) {
      console.error('Failed to update user insights:', error);
    }
  }

  /**
   * Get personalized recommendations based on behavior
   */
  async getPersonalizedRecommendations(
    userId: string,
    context?: {
      location?: { lat: number; lng: number; area?: string };
      category?: string;
      timeOfDay?: string;
    }
  ): Promise<any[]> {
    const insights = await this.getUserInsights(userId);
    if (!insights) return [];

    // This would integrate with the recommendation engine
    // For now, return simple category-based recommendations
    return insights.topCategories.slice(0, 5).map(category => ({
      type: 'category',
      value: category,
      reason: `Based on your interest in ${category} services`,
      confidence: 0.8
    }));
  }

  /**
   * Track user feedback on recommendations
   */
  async trackRecommendationFeedback(
    userId: string,
    recommendationId: string,
    feedback: 'liked' | 'disliked' | 'booked' | 'ignored',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Update recommendation log with feedback
      await prisma.recommendationLog.updateMany({
        where: {
          userId,
          id: recommendationId
        },
        data: {
          userFeedback: feedback,
          effectiveness: this.calculateEffectivenessScore(feedback)
        }
      });

      // Track as behavior event
      await this.trackEvent({
        userId,
        action: 'click',
        clickTarget: 'recommendation_feedback',
        metadata: {
          recommendationId,
          feedback,
          ...metadata
        }
      });
    } catch (error) {
      console.error('Failed to track recommendation feedback:', error);
    }
  }

  // Private Methods

  private async flushSession(sessionId: string): Promise<void> {
    const events = this.sessionEvents.get(sessionId);
    if (!events || events.length === 0) return;

    try {
      await this.trackEvents(events);
      this.sessionEvents.set(sessionId, []);
    } catch (error) {
      console.error('Failed to flush session events:', error);
    }
  }

  private startPeriodicFlush(): void {
    setInterval(async () => {
      for (const sessionId of this.sessionEvents.keys()) {
        await this.flushSession(sessionId);
      }
    }, this.FLUSH_INTERVAL);
  }

  private isCriticalEvent(action: string): boolean {
    return ['book', 'complete', 'review'].includes(action);
  }

  private async processCriticalEvent(event: BehaviorEvent): Promise<void> {
    // Immediate processing for booking, completion, and review events
    if (event.action === 'book' && event.serviceId) {
      await this.updateServicePopularity(event.serviceId, event.location);
    }
    
    if (event.action === 'complete' && event.serviceId && event.providerId) {
      await this.updateProviderMetrics(event.providerId);
    }
  }

  private async getRecentBehaviors(userId: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return await prisma.userBehavior.findMany({
      where: {
        userId,
        timestamp: { gte: since }
      },
      include: {
        service: true
      },
      orderBy: { timestamp: 'desc' }
    });
  }

  private async getUserBookings(userId: string) {
    return await prisma.booking.findMany({
      where: { userId },
      include: {
        service: true,
        review: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  private async getUserPreferences(userId: string) {
    return await prisma.userPreferences.findUnique({
      where: { userId }
    });
  }

  private async calculateInsights(
    userId: string,
    behaviors: any[],
    bookings: any[],
    preferences: any
  ): Promise<Partial<UserInsights>> {
    // Calculate top categories
    const categoryFreq = new Map<string, number>();
    behaviors.forEach(b => {
      if (b.category) {
        categoryFreq.set(b.category, (categoryFreq.get(b.category) || 0) + 1);
      }
    });
    bookings.forEach(b => {
      if (b.service?.category) {
        categoryFreq.set(b.service.category, (categoryFreq.get(b.service.category) || 0) + 2); // Weight bookings higher
      }
    });

    const topCategories = Array.from(categoryFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category);

    // Calculate most booked times
    const timeFreq = new Map<string, number>();
    bookings.forEach(b => {
      if (b.scheduledAt) {
        const hour = new Date(b.scheduledAt).getHours();
        const timeSlot = this.getTimeSlot(hour);
        timeFreq.set(timeSlot, (timeFreq.get(timeSlot) || 0) + 1);
      }
    });

    const mostBookedTimes = Array.from(timeFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([time]) => time);

    // Calculate average spending
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
    const averageSpending = completedBookings.length > 0
      ? completedBookings.reduce((sum, b) => sum + b.total, 0) / completedBookings.length
      : 0;

    // Calculate location hotspots
    const locationFreq = new Map<string, { count: number; services: Set<string> }>();
    behaviors.forEach(b => {
      if (b.location?.area) {
        const current = locationFreq.get(b.location.area) || { count: 0, services: new Set() };
        current.count++;
        if (b.category) current.services.add(b.category);
        locationFreq.set(b.location.area, current);
      }
    });

    const locationHotspots = Array.from(locationFreq.entries())
      .map(([area, data]) => ({
        area,
        frequency: data.count,
        services: Array.from(data.services)
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Calculate seasonal patterns
    const seasonalPatterns = this.calculateSeasonalPatterns(bookings);

    // Calculate provider affinities
    const providerFreq = new Map<string, number>();
    bookings.forEach(b => {
      if (b.providerId) {
        providerFreq.set(b.providerId, (providerFreq.get(b.providerId) || 0) + 1);
      }
    });

    const providerAffinities = Array.from(providerFreq.entries())
      .filter(([_, count]) => count >= 2) // Only providers used 2+ times
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([providerId]) => providerId);

    // Generate predicted needs
    const predictedNeeds = await this.generatePredictedNeeds(userId, behaviors, bookings);

    // Calculate personality profile
    const personalityProfile = this.calculatePersonalityProfile(behaviors, bookings, preferences);

    // Calculate booking patterns
    const bookingPatterns = this.calculateBookingPatterns(bookings);

    return {
      topCategories,
      mostBookedTimes,
      averageSpending,
      locationHotspots,
      seasonalPatterns,
      providerAffinities,
      predictedNeeds,
      personalityProfile,
      bookingPatterns
    };
  }

  private getTimeSlot(hour: number): string {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  private calculateSeasonalPatterns(bookings: any[]): Record<string, string[]> {
    const seasons = ['spring', 'summer', 'monsoon', 'autumn', 'winter'];
    const patterns: Record<string, Map<string, number>> = {};
    
    seasons.forEach(season => {
      patterns[season] = new Map();
    });

    bookings.forEach(booking => {
      const month = new Date(booking.createdAt).getMonth() + 1;
      const season = this.getSeasonFromMonth(month);
      const category = booking.service?.category;
      
      if (season && category) {
        const current = patterns[season].get(category) || 0;
        patterns[season].set(category, current + 1);
      }
    });

    const result: Record<string, string[]> = {};
    seasons.forEach(season => {
      result[season] = Array.from(patterns[season].entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category]) => category);
    });

    return result;
  }

  private getSeasonFromMonth(month: number): string {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  private async generatePredictedNeeds(
    userId: string,
    behaviors: any[],
    bookings: any[]
  ): Promise<Array<{ category: string; probability: number; reason: string }>> {
    const predictions = [];

    // Seasonal predictions
    const currentMonth = new Date().getMonth() + 1;
    const currentSeason = this.getSeasonFromMonth(currentMonth);
    const seasonalServices = this.getSeasonalServices(currentSeason);

    seasonalServices.forEach(category => {
      predictions.push({
        category,
        probability: 0.6,
        reason: `${category} services are commonly needed during ${currentSeason}`
      });
    });

    // Pattern-based predictions
    const lastBookings = bookings.slice(0, 5);
    const categoryPattern = new Map<string, Date[]>();
    
    lastBookings.forEach(booking => {
      const category = booking.service?.category;
      if (category) {
        if (!categoryPattern.has(category)) {
          categoryPattern.set(category, []);
        }
        categoryPattern.get(category)!.push(new Date(booking.createdAt));
      }
    });

    // Predict recurring needs
    categoryPattern.forEach((dates, category) => {
      if (dates.length >= 2) {
        const intervals = [];
        for (let i = 1; i < dates.length; i++) {
          const interval = dates[i-1].getTime() - dates[i].getTime();
          intervals.push(interval / (1000 * 60 * 60 * 24)); // days
        }
        
        const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
        const lastBooking = dates[0];
        const daysSinceLastBooking = (Date.now() - lastBooking.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastBooking >= avgInterval * 0.8) {
          predictions.push({
            category,
            probability: Math.min(0.9, daysSinceLastBooking / avgInterval),
            reason: `Based on your ${category} booking pattern (every ${Math.round(avgInterval)} days)`
          });
        }
      }
    });

    return predictions
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);
  }

  private calculatePersonalityProfile(behaviors: any[], bookings: any[], preferences: any): any {
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
    
    // Price consciousness
    const avgSpending = completedBookings.length > 0
      ? completedBookings.reduce((sum, b) => sum + b.total, 0) / completedBookings.length
      : 0;
    
    let priceConsciousness: 'low' | 'medium' | 'high' = 'medium';
    if (avgSpending < 1000) priceConsciousness = 'high';
    else if (avgSpending > 5000) priceConsciousness = 'low';

    // Booking frequency
    const monthlyBookings = completedBookings.length / 12; // Assuming 1 year of data
    let bookingFrequency: 'occasional' | 'regular' | 'frequent' = 'occasional';
    if (monthlyBookings >= 4) bookingFrequency = 'frequent';
    else if (monthlyBookings >= 1) bookingFrequency = 'regular';

    // Category diversity
    const uniqueCategories = new Set(completedBookings.map(b => b.service?.category).filter(Boolean));
    let categoryDiversity: 'focused' | 'moderate' | 'diverse' = 'focused';
    if (uniqueCategories.size >= 5) categoryDiversity = 'diverse';
    else if (uniqueCategories.size >= 3) categoryDiversity = 'moderate';

    // Time preference (simplified)
    const timePreference = 'flexible'; // Would calculate from booking times

    // Planning style
    const advanceBookings = completedBookings.filter(b => {
      if (!b.scheduledAt) return false;
      const advance = new Date(b.scheduledAt).getTime() - new Date(b.createdAt).getTime();
      return advance > 24 * 60 * 60 * 1000; // More than 1 day advance
    });
    
    const planningRatio = advanceBookings.length / completedBookings.length;
    let planningStyle: 'spontaneous' | 'planned' | 'mixed' = 'mixed';
    if (planningRatio >= 0.7) planningStyle = 'planned';
    else if (planningRatio <= 0.3) planningStyle = 'spontaneous';

    return {
      priceConsciousness,
      bookingFrequency,
      categoryDiversity,
      timePreference,
      planningStyle
    };
  }

  private calculateBookingPatterns(bookings: any[]): any {
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
    
    // Preferred days
    const dayFreq = new Map<string, number>();
    completedBookings.forEach(b => {
      if (b.scheduledAt) {
        const day = new Date(b.scheduledAt).toLocaleDateString('en', { weekday: 'long' });
        dayFreq.set(day, (dayFreq.get(day) || 0) + 1);
      }
    });
    
    const preferredDays = Array.from(dayFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);

    // Preferred time slots
    const timeSlotFreq = new Map<string, number>();
    completedBookings.forEach(b => {
      if (b.scheduledAt) {
        const hour = new Date(b.scheduledAt).getHours();
        const timeSlot = this.getTimeSlot(hour);
        timeSlotFreq.set(timeSlot, (timeSlotFreq.get(timeSlot) || 0) + 1);
      }
    });
    
    const preferredTimeSlots = Array.from(timeSlotFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([slot]) => slot);

    // Average advance booking
    const advanceTimes = completedBookings
      .filter(b => b.scheduledAt)
      .map(b => {
        const advance = new Date(b.scheduledAt).getTime() - new Date(b.createdAt).getTime();
        return advance / (1000 * 60 * 60 * 24); // days
      });
    
    const averageAdvanceBooking = advanceTimes.length > 0
      ? advanceTimes.reduce((sum, t) => sum + t, 0) / advanceTimes.length
      : 0;

    // Seasonal activity
    const seasonalActivity: Record<string, number> = {
      spring: 0,
      summer: 0,
      autumn: 0,
      winter: 0
    };
    
    completedBookings.forEach(b => {
      const month = new Date(b.createdAt).getMonth() + 1;
      const season = this.getSeasonFromMonth(month);
      seasonalActivity[season]++;
    });

    return {
      preferredDays,
      preferredTimeSlots,
      averageAdvanceBooking: Math.round(averageAdvanceBooking),
      seasonalActivity
    };
  }

  private getSeasonalServices(season: string): string[] {
    const services: Record<string, string[]> = {
      spring: ['Cleaning', 'Gardening', 'Renovation'],
      summer: ['AC Repair', 'Plumbing', 'Electrical'],
      autumn: ['Home Maintenance', 'Furniture Repair'],
      winter: ['Heating Repair', 'Home Security']
    };
    
    return services[season] || [];
  }

  private async updateServicePopularity(serviceId: string, location?: any): Promise<void> {
    // Update service popularity metrics
    // This would be implemented based on specific requirements
  }

  private async updateProviderMetrics(providerId: string): Promise<void> {
    // Update provider performance metrics
    // This would be implemented based on specific requirements
  }

  private calculateEffectivenessScore(feedback: string): number {
    const scores = {
      'liked': 0.8,
      'booked': 1.0,
      'disliked': 0.2,
      'ignored': 0.4
    };
    return scores[feedback as keyof typeof scores] || 0.5;
  }
}

export const behaviorTracker = BehaviorTracker.getInstance();