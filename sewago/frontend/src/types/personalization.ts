// Comprehensive TypeScript types for SewaGo Personalization Engine

export interface UserPreferences {
  id: string;
  userId: string;
  preferredCategories: string[];
  preferredTimeSlots: string[];
  preferredProviders: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  locationPreferences: {
    areas: string[];
    radius: number;
  };
  serviceFrequency: {
    [category: string]: 'rarely' | 'monthly' | 'weekly' | 'daily';
  };
  personalizedSettings: {
    showPriceFirst: boolean;
    prioritizeRating: boolean;
    preferFamiliarProviders: boolean;
    autoBookingEnabled: boolean;
    smartSchedulingEnabled: boolean;
  };
  culturalPreferences: {
    festivals: string[];
    traditions: string[];
    language: 'en' | 'ne';
    religiousConsiderations: string[];
  };
  languagePreference: 'en' | 'ne';
  notificationPreferences: {
    recommendations: boolean;
    offers: boolean;
    scheduling: boolean;
    reminders: boolean;
  };
  lastUpdated: string;
  createdAt: string;
}

export interface UserBehavior {
  id: string;
  userId: string;
  action: 'view' | 'book' | 'complete' | 'review' | 'search' | 'click' | 'favorite' | 'share';
  serviceId?: string;
  providerId?: string;
  category?: string;
  timeSpent?: number; // seconds
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  location?: {
    lat: number;
    lng: number;
    area: string;
    district: string;
  };
  searchQuery?: string;
  clickTarget?: string;
  sessionId?: string;
  timestamp: string;
}

export interface PersonalizationInsights {
  id: string;
  userId: string;
  topCategories: string[];
  mostBookedTimes: string[];
  averageSpending: number;
  locationHotspots: {
    area: string;
    frequency: number;
    services: string[];
  }[];
  seasonalPatterns: {
    season: string;
    preferences: string[];
    spending: number;
  }[];
  providerAffinities: string[];
  predictedNeeds: {
    service: string;
    probability: number;
    timeframe: string;
    reasoning: string;
  }[];
  personalityProfile: {
    priceConsciousness: number; // 0-1
    qualityFocus: number; // 0-1
    loyaltyTendency: number; // 0-1
    spontaneity: number; // 0-1
  };
  pricesensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
  bookingPatterns: {
    preferredDays: string[];
    preferredTimes: string[];
    bookingFrequency: number;
    advanceBookingTendency: number;
  };
  recommendationScore: number;
  lastAnalyzed: string;
  createdAt: string;
}

export interface RecommendationRequest {
  userId: string;
  algorithm?: 'collaborative' | 'content' | 'hybrid' | 'location' | 'seasonal';
  context?: {
    currentLocation?: {
      lat: number;
      lng: number;
      area?: string;
    };
    timeOfDay?: string;
    dayOfWeek?: string;
    season?: string;
    urgency?: 'low' | 'medium' | 'high';
    budget?: {
      min?: number;
      max?: number;
    };
  };
  filters?: {
    categories?: string[];
    excludeProviders?: string[];
    maxDistance?: number;
    minRating?: number;
  };
  limit?: number;
}

export interface ServiceRecommendation {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  estimatedPrice: number;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  confidence: number; // 0-1
  reasoning: string;
  tags: string[];
  availability: {
    nextAvailable: string;
    isAvailable: boolean;
  };
  provider?: {
    id: string;
    name: string;
    rating: number;
    distance?: number;
  };
  personalizedFactors: {
    pastUsage: boolean;
    locationMatch: boolean;
    budgetMatch: boolean;
    timeMatch: boolean;
    culturalRelevance: boolean;
  };
}

export interface ProviderRecommendation {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  services: string[];
  specialties: string[];
  distance?: number;
  estimatedArrival?: number; // minutes
  confidence: number;
  pricing: {
    level: 'budget' | 'standard' | 'premium';
    averageService: number;
  };
  badges: string[];
  languages: string[];
  availability: {
    isOnline: boolean;
    nextAvailable: string;
  };
  personalizedFactors: {
    previouslyUsed: boolean;
    locationMatch: boolean;
    serviceMatch: boolean;
    ratingPreference: boolean;
  };
}

export interface LocationBasedSuggestion {
  area: string;
  district: string;
  popularServices: {
    category: string;
    count: number;
    trending: boolean;
  }[];
  peakTimes: string[];
  averagePricing: {
    [category: string]: number;
  };
  culturalEvents: {
    name: string;
    date: string;
    relatedServices: string[];
  }[];
  weatherBasedSuggestions: {
    condition: string;
    services: string[];
  }[];
}

export interface PersonalizedOffer {
  id: string;
  type: 'discount' | 'bundle' | 'loyalty' | 'seasonal' | 'first_time';
  title: string;
  description: string;
  discountPercentage?: number;
  fixedDiscount?: number;
  services: string[];
  providers?: string[];
  validUntil: string;
  conditions: string[];
  targetingReason: string;
  culturalContext?: {
    festival: string;
    tradition: string;
  };
  usageLimit: number;
  isPersonalized: boolean;
}

export interface UsageInsight {
  period: 'week' | 'month' | 'year';
  totalBookings: number;
  totalSpent: number;
  averageRating: number;
  favoriteCategories: {
    category: string;
    count: number;
    percentage: number;
  }[];
  providerLoyalty: {
    providerId: string;
    providerName: string;
    bookingCount: number;
  }[];
  timePatterns: {
    day: string;
    hour: number;
    frequency: number;
  }[];
  savingsAchieved: number;
  comparisons: {
    previousPeriod: {
      bookings: number;
      spent: number;
      growth: number;
    };
    averageUser: {
      bookings: number;
      spent: number;
      comparison: 'above' | 'below' | 'similar';
    };
  };
}

export interface SmartSchedulingSuggestion {
  suggestedTime: string;
  confidence: number;
  reasoning: string;
  factors: {
    providerAvailability: boolean;
    userPreference: boolean;
    priceOptimization: boolean;
    weatherConsideration: boolean;
  };
  alternatives: {
    time: string;
    confidence: number;
    priceImpact?: number;
  }[];
  pricingInfo: {
    peakTime: boolean;
    expectedPrice: number;
    potentialSavings?: number;
  };
}

export interface PersonalizationDashboardData {
  user: {
    name: string;
    memberSince: string;
    tier: string;
    points: number;
  };
  quickActions: {
    label: string;
    action: string;
    icon: string;
    priority: number;
  }[];
  recommendations: {
    services: ServiceRecommendation[];
    providers: ProviderRecommendation[];
    offers: PersonalizedOffer[];
  };
  insights: UsageInsight;
  upcomingBookings: {
    id: string;
    serviceName: string;
    providerName: string;
    scheduledAt: string;
    status: string;
  }[];
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
  }[];
  goals: {
    title: string;
    current: number;
    target: number;
    reward?: string;
  }[];
}

export interface RecommendationFeedback {
  recommendationId: string;
  userId: string;
  feedback: 'liked' | 'disliked' | 'booked' | 'ignored' | 'shared';
  reason?: string;
  timestamp: string;
}

export interface PersonalizationConfig {
  algorithms: {
    collaborative: {
      enabled: boolean;
      weight: number;
      minSimilarity: number;
    };
    content: {
      enabled: boolean;
      weight: number;
      features: string[];
    };
    location: {
      enabled: boolean;
      weight: number;
      maxRadius: number;
    };
    seasonal: {
      enabled: boolean;
      weight: number;
      festivals: string[];
    };
  };
  performance: {
    maxRecommendations: number;
    cacheTimeMinutes: number;
    realtimeUpdates: boolean;
  };
  privacy: {
    dataRetentionDays: number;
    anonymizeAfterDays: number;
    shareWithProviders: boolean;
  };
}

// ML/AI related types
export interface MLModel {
  name: string;
  version: string;
  accuracy: number;
  lastTrained: string;
  features: string[];
  hyperparameters: Record<string, any>;
}

export interface PredictionInput {
  userId: string;
  contextFeatures: {
    timeOfDay: number;
    dayOfWeek: number;
    season: number;
    location: [number, number]; // [lat, lng]
    weatherCode: number;
    userActivity: number[];
    pricePreference: number;
  };
  historicalFeatures: {
    categoryPreferences: number[];
    providerAffinities: number[];
    timePatterns: number[];
    spendingPattern: number[];
  };
}

export interface PredictionOutput {
  predictions: {
    category: string;
    probability: number;
    confidence: number;
  }[];
  modelMetadata: {
    modelUsed: string;
    predictionTime: number;
    dataFreshness: string;
  };
}

// Event types for real-time updates
export interface PersonalizationEvent {
  type: 'preference_update' | 'behavior_tracked' | 'recommendation_generated' | 'feedback_received';
  userId: string;
  data: any;
  timestamp: string;
}

// API response types
export interface PersonalizationAPIResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
  metadata?: {
    processingTime: number;
    algorithm: string;
    cacheHit: boolean;
    version: string;
  };
}

export interface BatchRecommendationRequest {
  requests: RecommendationRequest[];
  options?: {
    maxConcurrency?: number;
    timeout?: number;
  };
}

export interface BatchRecommendationResponse {
  results: {
    userId: string;
    recommendations: ServiceRecommendation[];
    success: boolean;
    error?: string;
  }[];
  summary: {
    totalProcessed: number;
    successful: number;
    failed: number;
    averageProcessingTime: number;
  };
}

// Localization support
export interface LocalizedContent {
  en: string;
  ne: string;
}

export interface CulturalContext {
  festival: string;
  season: string;
  religiousObservance?: string;
  localEvent?: string;
  weatherPattern?: string;
}

export interface SeasonalPattern {
  season: 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter';
  festivals: string[];
  popularServices: string[];
  priceMultipliers: {
    [category: string]: number;
  };
  culturalConsiderations: string[];
}

// Performance monitoring types
export interface PersonalizationMetrics {
  responseTime: number;
  cacheHitRate: number;
  recommendationAccuracy: number;
  userEngagement: number;
  conversionRate: number;
  systemLoad: number;
}

export interface A11yPersonalization {
  visualPreferences: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
  };
  interactionPreferences: {
    keyboardNavigation: boolean;
    voiceControl: boolean;
    assistiveTechnology: string[];
  };
  contentPreferences: {
    simplifiedLanguage: boolean;
    audioDescriptions: boolean;
    alternativeFormats: string[];
  };
}