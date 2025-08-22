import { z } from 'zod';
import { SkillSDK } from '../sdk';
import { SkillCategory, PermissionLevel, ExecutionContext } from '../../types/core';
import { logger } from '../../utils/logger';

// Input/Output schemas for Predictive Needs Engine
const PredictiveNeedsInputSchema = z.object({
  userId: z.string(),
  currentContext: z.object({
    weather: z.object({
      current: z.object({
        temperature: z.number(),
        humidity: z.number(),
        condition: z.enum(['sunny', 'cloudy', 'rainy', 'stormy']),
        airQuality: z.number().min(0).max(500) // AQI
      }),
      forecast: z.object({
        nextWeek: z.array(z.object({
          date: z.string(),
          condition: z.string(),
          temperature: z.object({ min: z.number(), max: z.number() })
        }))
      })
    }),
    time: z.object({
      current: z.date(),
      dayOfWeek: z.number().min(0).max(6),
      season: z.enum(['spring', 'summer', 'monsoon', 'autumn', 'winter'])
    }),
    location: z.object({
      district: z.string(),
      area: z.string().optional(),
      buildingType: z.enum(['apartment', 'house', 'bungalow']).optional()
    }),
    recentActivity: z.array(z.object({
      type: z.string(),
      timestamp: z.date(),
      category: z.string(),
      satisfaction: z.number().min(1).max(5).optional()
    }))
  }),
  userHistory: z.array(z.object({
    serviceType: z.string(),
    bookingDate: z.date(),
    provider: z.string(),
    cost: z.number(),
    satisfaction: z.number().min(1).max(5),
    seasonalContext: z.string().optional(),
    isRecurring: z.boolean().default(false)
  })),
  householdProfile: z.object({
    familySize: z.number().min(1),
    hasChildren: z.boolean(),
    hasElderly: z.boolean(),
    hasPets: z.boolean(),
    homeSize: z.enum(['small', 'medium', 'large']),
    budgetRange: z.enum(['budget', 'mid_range', 'premium']),
    lifestyle: z.enum(['busy_professional', 'homemaker', 'retired', 'student'])
  })
});

const PredictiveNeedsOutputSchema = z.object({
  predictions: z.array(z.object({
    service: z.string(),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
    urgency: z.enum(['low', 'medium', 'high', 'emergency']),
    suggestedTiming: z.object({
      ideal: z.date(),
      acceptable: z.array(z.date()),
      deadline: z.date().optional()
    }),
    preventiveAction: z.boolean().default(false),
    costEstimate: z.object({
      min: z.number(),
      max: z.number(),
      currency: z.string().default('NPR')
    }),
    providers: z.array(z.object({
      id: z.string(),
      name: z.string(),
      rating: z.number(),
      availability: z.string()
    })).optional()
  })),
  proactiveNotifications: z.array(z.object({
    message: z.string(),
    type: z.enum(['reminder', 'warning', 'opportunity', 'seasonal']),
    priority: z.enum(['low', 'medium', 'high']),
    actionable: z.boolean(),
    scheduledFor: z.date(),
    channels: z.array(z.enum(['app', 'whatsapp', 'sms', 'email']))
  })),
  seasonalRecommendations: z.array(z.object({
    service: z.string(),
    reason: z.string(),
    bestTiming: z.string(),
    discountOpportunity: z.boolean(),
    communityTrend: z.boolean()
  })),
  engagementHooks: z.array(z.object({
    type: z.enum(['gamification', 'social_proof', 'savings', 'convenience']),
    message: z.string(),
    action: z.string(),
    incentive: z.string().optional()
  }))
});

type PredictiveNeedsInput = z.infer<typeof PredictiveNeedsInputSchema>;
type PredictiveNeedsOutput = z.infer<typeof PredictiveNeedsOutputSchema>;

// Predictive algorithms and data models
interface SeasonalPattern {
  season: string;
  commonServices: Array<{
    service: string;
    probability: number;
    timing: string;
    triggers: string[];
  }>;
}

interface BehaviorPattern {
  userId: string;
  patterns: Array<{
    serviceType: string;
    frequency: number; // days between bookings
    preferredTiming: string;
    seasonality: number; // 0-1 seasonal dependency
    triggers: string[];
  }>;
}

export class PredictiveNeedsEngine {
  
  // Seasonal service patterns for Nepal
  private seasonalPatterns: SeasonalPattern[] = [
    {
      season: 'monsoon',
      commonServices: [
        { service: 'roof_waterproofing', probability: 0.85, timing: 'before_monsoon', triggers: ['weather_forecast', 'previous_leak'] },
        { service: 'drain_cleaning', probability: 0.70, timing: 'early_monsoon', triggers: ['drainage_issues', 'flooding_risk'] },
        { service: 'electrical_check', probability: 0.60, timing: 'pre_monsoon', triggers: ['power_fluctuations', 'old_wiring'] },
        { service: 'pest_control', probability: 0.75, timing: 'post_monsoon', triggers: ['humidity_increase', 'pest_activity'] }
      ]
    },
    {
      season: 'winter',
      commonServices: [
        { service: 'heating_system', probability: 0.40, timing: 'early_winter', triggers: ['temperature_drop', 'elderly_family'] },
        { service: 'carpet_cleaning', probability: 0.65, timing: 'pre_winter', triggers: ['dust_accumulation', 'allergy_season'] },
        { service: 'water_heater_service', probability: 0.80, timing: 'before_winter', triggers: ['cold_weather', 'hot_water_issues'] }
      ]
    },
    {
      season: 'spring',
      commonServices: [
        { service: 'deep_cleaning', probability: 0.90, timing: 'early_spring', triggers: ['festival_season', 'winter_dust'] },
        { service: 'garden_maintenance', probability: 0.70, timing: 'mid_spring', triggers: ['plant_growth', 'landscaping'] },
        { service: 'ac_maintenance', probability: 0.85, timing: 'late_spring', triggers: ['temperature_rise', 'summer_preparation'] }
      ]
    }
  ];

  async execute(input: PredictiveNeedsInput, context: ExecutionContext): Promise<PredictiveNeedsOutput> {
    logger.info(`Generating predictive needs for user ${input.userId}`, {
      currentSeason: input.currentContext.time.season,
      weatherCondition: input.currentContext.weather.current.condition,
      location: input.currentContext.location.district
    });

    try {
      // 1. Analyze user behavior patterns
      const behaviorPatterns = await this.analyzeBehaviorPatterns(input.userHistory, input.householdProfile);
      
      // 2. Generate weather-based predictions
      const weatherPredictions = await this.generateWeatherBasedPredictions(
        input.currentContext.weather,
        input.currentContext.location,
        behaviorPatterns
      );

      // 3. Generate seasonal predictions
      const seasonalPredictions = await this.generateSeasonalPredictions(
        input.currentContext.time.season,
        input.householdProfile,
        behaviorPatterns
      );

      // 4. Analyze maintenance cycles
      const maintenancePredictions = await this.predictMaintenanceCycles(
        input.userHistory,
        input.currentContext.time.current
      );

      // 5. Generate community-based predictions
      const communityPredictions = await this.generateCommunityPredictions(
        input.currentContext.location,
        input.currentContext.time
      );

      // 6. Combine and rank all predictions
      const allPredictions = [
        ...weatherPredictions,
        ...seasonalPredictions,
        ...maintenancePredictions,
        ...communityPredictions
      ];

      const rankedPredictions = this.rankPredictions(allPredictions, input.householdProfile);

      // 7. Generate proactive notifications
      const notifications = this.generateProactiveNotifications(rankedPredictions, input.householdProfile);

      // 8. Generate seasonal recommendations
      const seasonalRecommendations = this.generateSeasonalRecommendations(
        input.currentContext.time.season,
        input.currentContext.location
      );

      // 9. Create engagement hooks
      const engagementHooks = this.createEngagementHooks(rankedPredictions, behaviorPatterns);

      return {
        predictions: rankedPredictions.slice(0, 8), // Top 8 predictions
        proactiveNotifications: notifications,
        seasonalRecommendations,
        engagementHooks
      };

    } catch (error) {
      logger.error('Predictive needs generation failed', {
        userId: input.userId,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  private async analyzeBehaviorPatterns(
    userHistory: PredictiveNeedsInput['userHistory'],
    householdProfile: PredictiveNeedsInput['householdProfile']
  ): Promise<BehaviorPattern[]> {
    const serviceFrequency = new Map<string, number[]>();
    
    // Analyze booking frequency for each service type
    userHistory.forEach(booking => {
      if (!serviceFrequency.has(booking.serviceType)) {
        serviceFrequency.set(booking.serviceType, []);
      }
      serviceFrequency.get(booking.serviceType)!.push(booking.bookingDate.getTime());
    });

    const patterns: BehaviorPattern['patterns'] = [];

    serviceFrequency.forEach((dates, serviceType) => {
      if (dates.length > 1) {
        dates.sort();
        const intervals = dates.slice(1).map((date, i) => (date - dates[i]) / (1000 * 60 * 60 * 24));
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        
        patterns.push({
          serviceType,
          frequency: Math.round(avgInterval),
          preferredTiming: this.inferPreferredTiming(dates),
          seasonality: this.calculateSeasonality(dates),
          triggers: this.identifyTriggers(serviceType, userHistory)
        });
      }
    });

    return [{ userId: '', patterns }];
  }

  private async generateWeatherBasedPredictions(
    weather: PredictiveNeedsInput['currentContext']['weather'],
    location: PredictiveNeedsInput['currentContext']['location'],
    behaviorPatterns: BehaviorPattern[]
  ): Promise<PredictiveNeedsOutput['predictions']> {
    const predictions: PredictiveNeedsOutput['predictions'] = [];
    
    // High humidity + upcoming rain = pest control
    if (weather.current.humidity > 70 && weather.forecast.nextWeek.some(day => day.condition.includes('rain'))) {
      predictions.push({
        service: 'pest_control',
        confidence: 0.75,
        reasoning: 'High humidity and upcoming rain increase pest activity risk',
        urgency: 'medium',
        suggestedTiming: {
          ideal: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          acceptable: [
            new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
          ]
        },
        preventiveAction: true,
        costEstimate: { min: 2000, max: 4000, currency: 'NPR' }
      });
    }

    // Poor air quality = air purifier/deep cleaning
    if (weather.current.airQuality > 150) {
      predictions.push({
        service: 'deep_cleaning',
        confidence: 0.65,
        reasoning: 'Poor air quality (AQI: ' + weather.current.airQuality + ') requires thorough cleaning',
        urgency: 'medium',
        suggestedTiming: {
          ideal: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          acceptable: [new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)]
        },
        preventiveAction: false,
        costEstimate: { min: 1500, max: 3000, currency: 'NPR' }
      });
    }

    // Temperature rise = AC maintenance
    const avgTemp = weather.forecast.nextWeek.reduce((sum, day) => sum + day.temperature.max, 0) / 7;
    if (avgTemp > 28 && new Date().getMonth() >= 2 && new Date().getMonth() <= 4) { // March-May
      predictions.push({
        service: 'ac_maintenance',
        confidence: 0.80,
        reasoning: 'Temperature rising above 28°C - AC maintenance recommended before summer peak',
        urgency: 'medium',
        suggestedTiming: {
          ideal: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
          acceptable: [
            new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
          ]
        },
        preventiveAction: true,
        costEstimate: { min: 1200, max: 2500, currency: 'NPR' }
      });
    }

    return predictions;
  }

  private async generateSeasonalPredictions(
    currentSeason: string,
    householdProfile: PredictiveNeedsInput['householdProfile'],
    behaviorPatterns: BehaviorPattern[]
  ): Promise<PredictiveNeedsOutput['predictions']> {
    const seasonPattern = this.seasonalPatterns.find(p => p.season === currentSeason);
    if (!seasonPattern) return [];

    return seasonPattern.commonServices.map(service => ({
      service: service.service,
      confidence: service.probability * this.getHouseholdMultiplier(householdProfile, service.service),
      reasoning: `${currentSeason} season: ${service.timing} is optimal for ${service.service}`,
      urgency: service.timing.includes('before') ? 'high' : 'medium' as const,
      suggestedTiming: {
        ideal: this.calculateIdealTiming(service.timing),
        acceptable: this.calculateAcceptableTimings(service.timing)
      },
      preventiveAction: service.timing.includes('before'),
      costEstimate: this.estimateServiceCost(service.service, householdProfile)
    }));
  }

  private async predictMaintenanceCycles(
    userHistory: PredictiveNeedsInput['userHistory'],
    currentDate: Date
  ): Promise<PredictiveNeedsOutput['predictions']> {
    const predictions: PredictiveNeedsOutput['predictions'] = [];
    
    // Standard maintenance cycles
    const maintenanceCycles: Record<string, number> = {
      'ac_maintenance': 365, // 1 year
      'deep_cleaning': 90,   // 3 months  
      'pest_control': 180,   // 6 months
      'electrical_check': 730, // 2 years
      'plumbing_check': 365,   // 1 year
      'appliance_service': 365 // 1 year
    };

    userHistory.forEach(booking => {
      const serviceType = booking.serviceType;
      const cycleLength = maintenanceCycles[serviceType];
      
      if (cycleLength) {
        const daysSinceBooking = (currentDate.getTime() - booking.bookingDate.getTime()) / (1000 * 60 * 60 * 24);
        const cyclProgress = daysSinceBooking / cycleLength;
        
        if (cyclProgress >= 0.8) { // 80% of cycle completed
          const urgency = cyclProgress >= 1.1 ? 'high' : cyclProgress >= 1.0 ? 'medium' : 'low';
          
          predictions.push({
            service: serviceType,
            confidence: Math.min(0.9, cyclProgress * 0.7),
            reasoning: `Last ${serviceType} was ${Math.round(daysSinceBooking)} days ago. Regular maintenance due.`,
            urgency: urgency as 'low' | 'medium' | 'high',
            suggestedTiming: {
              ideal: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000),
              acceptable: [
                new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000),
                new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000)
              ]
            },
            preventiveAction: true,
            costEstimate: this.estimateServiceCost(serviceType, {} as any)
          });
        }
      }
    });

    return predictions;
  }

  private async generateCommunityPredictions(
    location: PredictiveNeedsInput['currentContext']['location'],
    time: PredictiveNeedsInput['currentContext']['time']
  ): Promise<PredictiveNeedsOutput['predictions']> {
    // Mock community trends - in production, this would query actual community data
    const communityTrends = [
      {
        service: 'solar_panel_installation',
        trend: 'increasing',
        confidence: 0.60,
        reason: '8 installations in your area this month'
      },
      {
        service: 'home_security',
        trend: 'stable',
        confidence: 0.45,
        reason: 'Popular choice among neighbors'
      }
    ];

    return communityTrends.map(trend => ({
      service: trend.service,
      confidence: trend.confidence,
      reasoning: `Community trend: ${trend.reason}`,
      urgency: 'low' as const,
      suggestedTiming: {
        ideal: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        acceptable: [new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
      },
      preventiveAction: false,
      costEstimate: this.estimateServiceCost(trend.service, {} as any)
    }));
  }

  private rankPredictions(
    predictions: PredictiveNeedsOutput['predictions'],
    householdProfile: PredictiveNeedsInput['householdProfile']
  ): PredictiveNeedsOutput['predictions'] {
    return predictions
      .sort((a, b) => {
        // Sort by urgency first, then confidence
        const urgencyWeight = { emergency: 4, high: 3, medium: 2, low: 1 };
        const urgencyDiff = urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
        if (urgencyDiff !== 0) return urgencyDiff;
        
        return b.confidence - a.confidence;
      })
      .slice(0, 10); // Top 10 predictions
  }

  private generateProactiveNotifications(
    predictions: PredictiveNeedsOutput['predictions'],
    householdProfile: PredictiveNeedsInput['householdProfile']
  ): PredictiveNeedsOutput['proactiveNotifications'] {
    return predictions
      .filter(p => p.confidence > 0.6 && p.urgency !== 'low')
      .slice(0, 5)
      .map(prediction => ({
        message: this.createNotificationMessage(prediction, householdProfile),
        type: prediction.preventiveAction ? 'warning' as const : 'opportunity' as const,
        priority: prediction.urgency === 'high' ? 'high' as const : 'medium' as const,
        actionable: true,
        scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        channels: ['app' as const, 'whatsapp' as const]
      }));
  }

  private generateSeasonalRecommendations(
    currentSeason: string,
    location: PredictiveNeedsInput['currentContext']['location']
  ): PredictiveNeedsOutput['seasonalRecommendations'] {
    const seasonalTips: Record<string, PredictiveNeedsOutput['seasonalRecommendations']> = {
      monsoon: [
        {
          service: 'waterproofing',
          reason: 'Prevent water damage during heavy rains',
          bestTiming: 'Before monsoon peak (May-June)',
          discountOpportunity: true,
          communityTrend: true
        }
      ],
      winter: [
        {
          service: 'heating_solutions',
          reason: 'Stay warm during cold months',
          bestTiming: 'Early winter (November)',
          discountOpportunity: false,
          communityTrend: false
        }
      ],
      spring: [
        {
          service: 'spring_cleaning',
          reason: 'Fresh start for the new season',
          bestTiming: 'Early spring (March-April)',
          discountOpportunity: true,
          communityTrend: true
        }
      ]
    };

    return seasonalTips[currentSeason] || [];
  }

  private createEngagementHooks(
    predictions: PredictiveNeedsOutput['predictions'],
    behaviorPatterns: BehaviorPattern[]
  ): PredictiveNeedsOutput['engagementHooks'] {
    const hooks: PredictiveNeedsOutput['engagementHooks'] = [];

    // Savings hook
    if (predictions.length >= 2) {
      hooks.push({
        type: 'savings',
        message: `Bundle ${predictions[0].service} + ${predictions[1].service} and save NPR 500!`,
        action: 'View bundle offer',
        incentive: 'NPR 500 savings'
      });
    }

    // Social proof hook
    hooks.push({
      type: 'social_proof',
      message: '23 neighbors booked similar services this month',
      action: 'See what\'s trending',
      incentive: 'Join the trend'
    });

    // Gamification hook
    hooks.push({
      type: 'gamification',
      message: 'Complete 2 more bookings to unlock "Home Care Pro" badge!',
      action: 'View progress',
      incentive: 'Unlock achievement'
    });

    return hooks;
  }

  // Helper methods
  private inferPreferredTiming(timestamps: number[]): string {
    // Analyze day of week and time patterns
    const dates = timestamps.map(ts => new Date(ts));
    const daysOfWeek = dates.map(d => d.getDay());
    const hours = dates.map(d => d.getHours());
    
    const commonDay = this.getMostFrequent(daysOfWeek);
    const commonHour = this.getMostFrequent(hours);
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = commonHour < 12 ? 'morning' : commonHour < 17 ? 'afternoon' : 'evening';
    
    return `${dayNames[commonDay]} ${timeSlots}`;
  }

  private calculateSeasonality(timestamps: number[]): number {
    const dates = timestamps.map(ts => new Date(ts));
    const months = dates.map(d => d.getMonth());
    const uniqueMonths = new Set(months).size;
    return 1 - (uniqueMonths / 12); // Higher value = more seasonal
  }

  private identifyTriggers(serviceType: string, userHistory: PredictiveNeedsInput['userHistory']): string[] {
    // Simple trigger identification based on service type
    const triggerMap: Record<string, string[]> = {
      'pest_control': ['humidity', 'season_change', 'previous_sighting'],
      'ac_maintenance': ['temperature_rise', 'cooling_efficiency', 'filter_change'],
      'deep_cleaning': ['festival_season', 'air_quality', 'guest_arrival'],
      'electrical_check': ['power_fluctuation', 'appliance_issues', 'safety_concern']
    };
    
    return triggerMap[serviceType] || ['maintenance_cycle'];
  }

  private getMostFrequent<T>(arr: T[]): T {
    const frequency = arr.reduce((acc, val) => {
      acc.set(val, (acc.get(val) || 0) + 1);
      return acc;
    }, new Map<T, number>());
    
    return Array.from(frequency.entries()).reduce((a, b) => frequency.get(a[0])! > frequency.get(b[0])! ? a : b)[0];
  }

  private getHouseholdMultiplier(profile: PredictiveNeedsInput['householdProfile'], service: string): number {
    let multiplier = 1.0;
    
    // Adjust based on household characteristics
    if (profile.hasChildren && service.includes('cleaning')) multiplier += 0.2;
    if (profile.hasElderly && service.includes('maintenance')) multiplier += 0.1;
    if (profile.hasPets && service.includes('pest_control')) multiplier += 0.3;
    if (profile.homeSize === 'large') multiplier += 0.1;
    
    return Math.min(multiplier, 1.0);
  }

  private calculateIdealTiming(timing: string): Date {
    const now = new Date();
    const timingMap: Record<string, number> = {
      'before_monsoon': 30, // 30 days from now
      'early_monsoon': 60,
      'pre_winter': 45,
      'early_spring': 14
    };
    
    const days = timingMap[timing] || 7;
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private calculateAcceptableTimings(timing: string): Date[] {
    const ideal = this.calculateIdealTiming(timing);
    return [
      new Date(ideal.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before
      new Date(ideal.getTime() + 7 * 24 * 60 * 60 * 1000)  // 1 week after
    ];
  }

  private estimateServiceCost(service: string, profile: PredictiveNeedsInput['householdProfile']): { min: number; max: number; currency: string } {
    const baseCosts: Record<string, { min: number; max: number }> = {
      'pest_control': { min: 2000, max: 4000 },
      'ac_maintenance': { min: 1200, max: 2500 },
      'deep_cleaning': { min: 1500, max: 3500 },
      'electrical_check': { min: 1000, max: 2000 },
      'waterproofing': { min: 5000, max: 15000 },
      'solar_panel_installation': { min: 50000, max: 200000 }
    };
    
    const baseCost = baseCosts[service] || { min: 1000, max: 3000 };
    const sizeMultiplier = profile.homeSize === 'large' ? 1.5 : profile.homeSize === 'medium' ? 1.2 : 1.0;
    
    return {
      min: Math.round(baseCost.min * sizeMultiplier),
      max: Math.round(baseCost.max * sizeMultiplier),
      currency: 'NPR'
    };
  }

  private createNotificationMessage(
    prediction: PredictiveNeedsOutput['predictions'][0],
    profile: PredictiveNeedsInput['householdProfile']
  ): string {
    const serviceNames: Record<string, string> = {
      'pest_control': 'pest control',
      'ac_maintenance': 'AC maintenance',
      'deep_cleaning': 'deep cleaning',
      'electrical_check': 'electrical checkup',
      'waterproofing': 'roof waterproofing'
    };

    const serviceName = serviceNames[prediction.service] || prediction.service;
    
    if (prediction.preventiveAction) {
      return `⚠️ ${prediction.reasoning}. Book ${serviceName} now to avoid issues later! Estimated: NPR ${prediction.costEstimate.min}-${prediction.costEstimate.max}`;
    } else {
      return `💡 Perfect time for ${serviceName}! ${prediction.reasoning}. Get quotes from NPR ${prediction.costEstimate.min}`;
    }
  }
}

// Register the skill
export const registerPredictiveNeeds = () => {
  const skill = new PredictiveNeedsEngine();
  
  return SkillSDK.createSkill()
    .name('AI Needs Predictor')
    .description('Predicts customer needs before they search, enabling proactive assistance')
    .category(SkillCategory.CUSTOMER)
    .permissions(['users:read_history', 'weather:read', 'community:read_trends', 'services:read'])
    .permissionLevel(PermissionLevel.READ)
    .rateLimit(10, 60 * 60 * 1000) // 10 requests per hour
    .spendingCost(2) // Low cost for high-frequency use
    .inputSchema(PredictiveNeedsInputSchema)
    .outputSchema(PredictiveNeedsOutputSchema)
    .timeout(10000) // 10 second timeout
    .cacheable(30 * 60 * 1000) // Cache for 30 minutes
    .execute(async (input, context) => skill.execute(input, context))
    .register();
};