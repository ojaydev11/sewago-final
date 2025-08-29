'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PersonalizationDashboardData,
  ServiceRecommendation,
  ProviderRecommendation,
  PersonalizedOffer,
  UserPreferences,
  UserBehavior,
  PersonalizationInsights,
  RecommendationRequest,
  PersonalizationAPIResponse,
  SmartSchedulingSuggestion,
  LocationBasedSuggestion,
  RecommendationFeedback,
} from '@/types/personalization';

// Main personalization hook
export function usePersonalization(userId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const behaviorQueueRef = useRef<Omit<UserBehavior, 'id' | 'timestamp'>[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Track user behavior with batching for performance
  const trackBehavior = useCallback(async (behavior: Omit<UserBehavior, 'id' | 'timestamp'>) => {
    if (!userId) return;

    // Add to queue
    behaviorQueueRef.current.push({
      ...behavior,
      userId: behavior.userId || userId,
    });

    // Clear existing timeout
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
    }

    // Set new timeout to flush queue
    flushTimeoutRef.current = setTimeout(async () => {
      if (behaviorQueueRef.current.length === 0) return;

      try {
        const behaviors = [...behaviorQueueRef.current];
        behaviorQueueRef.current = [];

        await fetch('/api/personalization/behavior', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ behaviors, userId }),
        });
      } catch (error) {
        console.error('Failed to flush behavior queue:', error);
        // Re-add behaviors to queue for retry
        behaviorQueueRef.current.unshift(...behaviorQueueRef.current);
      }
    }, 2000); // Batch behaviors for 2 seconds
  }, [userId]);

  // Track service view
  const trackServiceView = useCallback((serviceId: string, category?: string, timeSpent?: number) => {
    trackBehavior({
      userId,
      action: 'view',
      serviceId,
      category,
      timeSpent,
    });
  }, [userId, trackBehavior]);

  // Track service booking
  const trackServiceBooking = useCallback((serviceId: string, providerId?: string, category?: string) => {
    trackBehavior({
      userId,
      action: 'book',
      serviceId,
      providerId,
      category,
    });
  }, [userId, trackBehavior]);

  // Track search behavior
  const trackSearch = useCallback((searchQuery: string, category?: string) => {
    trackBehavior({
      userId,
      action: 'search',
      searchQuery,
      category,
    });
  }, [userId, trackBehavior]);

  // Track clicks
  const trackClick = useCallback((clickTarget: string, serviceId?: string, category?: string) => {
    trackBehavior({
      userId,
      action: 'click',
      clickTarget,
      serviceId,
      category,
    });
  }, [userId, trackBehavior]);

  // Track favorites
  const trackFavorite = useCallback((serviceId: string, category?: string) => {
    trackBehavior({
      userId,
      action: 'favorite',
      serviceId,
      category,
    });
  }, [userId, trackBehavior]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
        // Immediately flush remaining behaviors
        if (behaviorQueueRef.current.length > 0) {
          fetch('/api/personalization/behavior', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ behaviors: behaviorQueueRef.current, userId }),
          }).catch(console.error);
        }
      }
    };
  }, [userId]);

  return {
    loading,
    error,
    trackBehavior,
    trackServiceView,
    trackServiceBooking,
    trackSearch,
    trackClick,
    trackFavorite,
  };
}

// Hook for getting personalized recommendations
export function useRecommendations(userId: string, filters?: Partial<RecommendationRequest>) {
  const [recommendations, setRecommendations] = useState<{
    services: ServiceRecommendation[];
    providers: ProviderRecommendation[];
  }>({ services: [], providers: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = useCallback(async (refresh = false) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        userId,
        algorithm: filters?.algorithm || 'hybrid',
        limit: (filters?.limit || 10).toString(),
      });

      // Add filters
      if (filters?.context?.currentLocation) {
        params.append('lat', filters.context.currentLocation.lat.toString());
        params.append('lng', filters.context.currentLocation.lng.toString());
        if (filters.context.currentLocation.area) {
          params.append('area', filters.context.currentLocation.area);
        }
      }

      if (filters?.filters?.categories?.length) {
        params.append('categories', filters.filters.categories.join(','));
      }

      if (filters?.context?.budget) {
        if (filters.context.budget.min) {
          params.append('budgetMin', filters.context.budget.min.toString());
        }
        if (filters.context.budget.max) {
          params.append('budgetMax', filters.context.budget.max.toString());
        }
      }

      const response = await fetch(`/api/personalization/recommendations?${params}`);
      const result = await response.json();

      if (result.success) {
        setRecommendations({
          services: result.data.services || [],
          providers: result.data.providers || [],
        });
      } else {
        setError(result.error || 'Failed to load recommendations');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, filters]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const refresh = useCallback(() => loadRecommendations(true), [loadRecommendations]);

  return {
    recommendations,
    loading,
    error,
    refresh,
  };
}

// Hook for getting personalized dashboard data
export function usePersonalizedDashboard(userId: string) {
  const [dashboardData, setDashboardData] = useState<PersonalizationDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (refresh = false) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/personalization/dashboard?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError(result.error || 'Failed to load dashboard');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const refresh = useCallback(() => loadDashboard(true), [loadDashboard]);

  return {
    dashboardData,
    loading,
    error,
    refresh,
  };
}

// Hook for managing user preferences
export function useUserPreferences(userId: string) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/personalization/preferences?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setPreferences(result.data);
      } else {
        setError(result.error || 'Failed to load preferences');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!userId) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/personalization/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, preferences: updates }),
      });

      const result = await response.json();

      if (result.success) {
        setPreferences(result.data);
        return true;
      } else {
        setError(result.error || 'Failed to update preferences');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error updating preferences:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createInitialPreferences = useCallback(async (onboardingData: any) => {
    if (!userId) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/personalization/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, onboardingData }),
      });

      const result = await response.json();

      if (result.success) {
        setPreferences(result.data);
        return true;
      } else {
        setError(result.error || 'Failed to create preferences');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error creating preferences:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    createInitialPreferences,
    refresh: loadPreferences,
  };
}

// Hook for smart scheduling suggestions
export function useSmartScheduling(userId: string, serviceId?: string, providerId?: string) {
  const [suggestions, setSuggestions] = useState<SmartSchedulingSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = useCallback(async () => {
    if (!userId || !serviceId) return;

    try {
      setLoading(true);
      setError(null);

      // This would call the smart scheduling API
      const params = new URLSearchParams({
        userId,
        serviceId,
      });

      if (providerId) {
        params.append('providerId', providerId);
      }

      // Mock response for now
      const mockSuggestions: SmartSchedulingSuggestion[] = [
        {
          suggestedTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          confidence: 0.9,
          reasoning: 'Best time based on your booking history',
          factors: {
            providerAvailability: true,
            userPreference: true,
            priceOptimization: false,
            weatherConsideration: true,
          },
          alternatives: [
            {
              time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
              confidence: 0.8,
              priceImpact: -100,
            },
          ],
          pricingInfo: {
            peakTime: false,
            expectedPrice: 2000,
            potentialSavings: 200,
          },
        },
      ];

      setSuggestions(mockSuggestions);
    } catch (err) {
      setError('Failed to load scheduling suggestions');
      console.error('Error loading scheduling suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, serviceId, providerId]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  return {
    suggestions,
    loading,
    error,
    refresh: loadSuggestions,
  };
}

// Hook for location-based suggestions
export function useLocationSuggestions(userId: string, location?: { lat: number; lng: number; area?: string }) {
  const [suggestions, setSuggestions] = useState<LocationBasedSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = useCallback(async () => {
    if (!userId || !location) return;

    try {
      setLoading(true);
      setError(null);

      // This would call the location suggestions API
      // Mock response for now
      const mockSuggestions: LocationBasedSuggestion[] = [
        {
          area: location.area || 'Your Area',
          district: 'Kathmandu',
          popularServices: [
            { category: 'cleaning', count: 45, trending: true },
            { category: 'maintenance', count: 32, trending: false },
            { category: 'beauty', count: 28, trending: true },
          ],
          peakTimes: ['10:00', '14:00', '18:00'],
          averagePricing: {
            cleaning: 1500,
            maintenance: 2500,
            beauty: 1200,
          },
          culturalEvents: [],
          weatherBasedSuggestions: [
            { condition: 'sunny', services: ['car_wash', 'outdoor_cleaning'] },
          ],
        },
      ];

      setSuggestions(mockSuggestions);
    } catch (err) {
      setError('Failed to load location suggestions');
      console.error('Error loading location suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, location]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  return {
    suggestions,
    loading,
    error,
    refresh: loadSuggestions,
  };
}

// Hook for recommendation feedback
export function useRecommendationFeedback() {
  const submitFeedback = useCallback(async (feedback: Omit<RecommendationFeedback, 'timestamp'>) => {
    try {
      const response = await fetch('/api/personalization/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedback,
          timestamp: new Date().toISOString(),
        }),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      return false;
    }
  }, []);

  return {
    submitFeedback,
  };
}

// Hook for A/B testing personalization features
export function usePersonalizationExperiment(experimentId: string, userId: string) {
  const [variant, setVariant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple hash-based assignment for demonstration
    const hash = simpleHash(`${experimentId}-${userId}`);
    const variantIndex = hash % 2;
    const variants = ['control', 'treatment'];
    
    setVariant(variants[variantIndex]);
    setLoading(false);
  }, [experimentId, userId]);

  const trackExperimentEvent = useCallback(async (eventType: string, data?: any) => {
    if (!variant) return;

    try {
      await fetch('/api/personalization/experiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId,
          userId,
          variant,
          eventType,
          data,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to track experiment event:', error);
    }
  }, [experimentId, userId, variant]);

  return {
    variant,
    loading,
    trackExperimentEvent,
  };
}

// Utility function for simple hashing
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Context providers could be added here for global state management
export * from '@/types/personalization';