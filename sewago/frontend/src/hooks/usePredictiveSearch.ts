'use client';
import 'client-only';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';

interface SearchPrediction {
  type: 'service' | 'category' | 'popular';
  id: string;
  title: string;
  description?: string;
  category: string;
  price?: number;
  city?: string;
  slug?: string;
  imageUrl?: string;
  score: number;
  searchType: string;
  count?: number;
}

interface SearchCorrection {
  original: string;
  corrected: string;
  confidence: number;
}

interface AutocompleteSuggestion {
  text: string;
  type: 'service' | 'category' | 'popular' | 'personal' | 'personalized_service';
  category?: string;
  price?: number;
  city?: string;
  slug?: string;
  count?: number;
  score: number;
  icon: string;
}

interface SearchAnalytics {
  totalSearches: number;
  successRate: number;
  abandonmentRate: number;
  correctionRate: number;
  topQueries: Array<{ query: string; count: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
}

interface UsePredictiveSearchConfig {
  userId?: string;
  location?: { city?: string; lat?: number; lng?: number };
  debounceMs?: number;
  minQueryLength?: number;
  enableAnalytics?: boolean;
  enableCorrections?: boolean;
}

interface UsePredictiveSearchReturn {
  // Query state
  query: string;
  setQuery: (query: string) => void;
  debouncedQuery: string;
  
  // Predictions
  predictions: SearchPrediction[];
  isPredictionsLoading: boolean;
  predictionError: string | null;
  
  // Autocomplete
  suggestions: AutocompleteSuggestion[];
  isSuggestionsLoading: boolean;
  
  // Corrections
  corrections: SearchCorrection | null;
  acceptCorrection: () => void;
  
  // Analytics
  analytics: SearchAnalytics | null;
  searchHistory: string[];
  
  // Actions
  search: (searchQuery?: string) => void;
  clearQuery: () => void;
  clearHistory: () => void;
  trackAnalytics: (action: string, data: any) => Promise<void>;
  
  // Session
  sessionId: string;
  popularSearches: Array<{ query: string; count: number; type: string }>;
}

export function usePredictiveSearch(config: UsePredictiveSearchConfig = {}): UsePredictiveSearchReturn {
  const {
    userId,
    location,
    debounceMs = 300,
    minQueryLength = 2,
    enableAnalytics = true,
    enableCorrections = true
  } = config;

  // State
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<SearchPrediction[]>([]);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [corrections, setCorrections] = useState<SearchCorrection | null>(null);
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<Array<{ query: string; count: number; type: string }>>([]);
  
  // Loading states
  const [isPredictionsLoading, setIsPredictionsLoading] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  
  // Error states
  const [predictionError, setPredictionError] = useState<string | null>(null);
  
  // Refs
  const sessionIdRef = useRef(`search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced query
  const debouncedQuery = useDebounce(query, debounceMs);

  // Load search history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sewago_search_history');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSearchHistory(parsed.slice(0, 20)); // Keep last 20 searches
        } catch (error) {
          console.error('Failed to parse search history:', error);
        }
      }
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = useCallback((newHistory: string[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sewago_search_history', JSON.stringify(newHistory));
    }
  }, []);

  // Fetch predictions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= minQueryLength) {
      fetchPredictions(debouncedQuery);
    } else {
      setPredictions([]);
      setCorrections(null);
      setPredictionError(null);
    }
  }, [debouncedQuery, location, userId, minQueryLength]);

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (query.length >= 1) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query, location, userId]);

  // Load analytics if enabled
  useEffect(() => {
    if (enableAnalytics) {
      loadAnalytics();
    }
  }, [enableAnalytics, userId]);

  const fetchPredictions = async (searchQuery: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsPredictionsLoading(true);
    setPredictionError(null);

    try {
      const response = await fetch('/api/ai/search-predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          location,
          sessionId: sessionIdRef.current,
          userId
        }),
        signal: controller.signal
      });

      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || []);
        setPopularSearches(data.popularSearches || []);
        
        if (enableCorrections && data.corrections) {
          setCorrections(data.corrections);
        }
      } else {
        setPredictionError('Failed to fetch search predictions');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Prediction fetch error:', error);
        setPredictionError('Network error. Please check your connection.');
      }
    } finally {
      setIsPredictionsLoading(false);
    }
  };

  const fetchSuggestions = async (searchQuery: string) => {
    setIsSuggestionsLoading(true);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: '8'
      });

      if (location?.city) {
        params.append('location', location.city);
      }

      if (userId) {
        params.append('userId', userId);
      }

      const response = await fetch(`/api/ai/search-autocomplete?${params}`);

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Suggestions fetch error:', error);
    } finally {
      setIsSuggestionsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        timeframe: '30d'
      });

      if (userId) {
        params.append('userId', userId);
      }

      const response = await fetch(`/api/ai/search-analytics?${params}`);

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
    }
  };

  const search = useCallback((searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    const correctedQuery = corrections?.corrected || finalQuery;

    if (!correctedQuery.trim()) return;

    // Add to search history
    const newHistory = [correctedQuery, ...searchHistory.filter(h => h !== correctedQuery)].slice(0, 20);
    setSearchHistory(newHistory);
    saveSearchHistory(newHistory);

    // Track search analytics
    if (enableAnalytics) {
      trackAnalytics('search_performed', {
        query: correctedQuery,
        resultCount: predictions.length,
        hasCorrection: !!corrections,
        originalQuery: corrections?.original
      });
    }

    // Navigate to search results
    const searchUrl = `/search?q=${encodeURIComponent(correctedQuery)}${location?.city ? `&location=${encodeURIComponent(location.city)}` : ''}`;
    window.location.href = searchUrl;
  }, [query, corrections, searchHistory, predictions, location, enableAnalytics]);

  const acceptCorrection = useCallback(() => {
    if (corrections) {
      setQuery(corrections.corrected);
      setCorrections(null);
      
      if (enableAnalytics) {
        trackAnalytics('query_corrected', {
          original: corrections.original,
          corrected: corrections.corrected,
          confidence: corrections.confidence
        });
      }
    }
  }, [corrections, enableAnalytics]);

  const clearQuery = useCallback(() => {
    setQuery('');
    setPredictions([]);
    setSuggestions([]);
    setCorrections(null);
    setPredictionError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sewago_search_history');
    }
  }, []);

  const trackAnalytics = useCallback(async (action: string, data: any) => {
    if (!enableAnalytics) return;

    try {
      await fetch('/api/ai/search-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          sessionId: sessionIdRef.current,
          userId,
          timestamp: new Date().toISOString(),
          ...data
        }),
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, [enableAnalytics, userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Query state
    query,
    setQuery,
    debouncedQuery,
    
    // Predictions
    predictions,
    isPredictionsLoading,
    predictionError,
    
    // Autocomplete
    suggestions,
    isSuggestionsLoading,
    
    // Corrections
    corrections,
    acceptCorrection,
    
    // Analytics
    analytics,
    searchHistory,
    
    // Actions
    search,
    clearQuery,
    clearHistory,
    trackAnalytics,
    
    // Session
    sessionId: sessionIdRef.current,
    popularSearches
  };
}

export default usePredictiveSearch;