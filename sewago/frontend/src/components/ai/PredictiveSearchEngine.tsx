'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Mic, MicOff, X, TrendingUp, Clock, MapPin, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocalizedCurrency } from '@/hooks/useLocalizedCurrency';
import { SearchSuggestions } from './SearchSuggestions';
import { SearchResultsPredictor } from './SearchResultsPredictor';
import { VoiceSearchInterface } from './VoiceSearchInterface';

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

interface PredictiveSearchEngineProps {
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  showVoiceSearch?: boolean;
  onSearchPerformed?: (query: string, results: SearchPrediction[]) => void;
}

export function PredictiveSearchEngine({
  placeholder = "Search for services...",
  className = "",
  showFilters = true,
  showVoiceSearch = true,
  onSearchPerformed
}: PredictiveSearchEngineProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<SearchPrediction[]>([]);
  const [popularSearches, setPopularSearches] = useState<any[]>([]);
  const [corrections, setCorrections] = useState<SearchCorrection | null>(null);
  const [sessionId] = useState(() => `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [location, setLocation] = useState<{ city?: string; lat?: number; lng?: number } | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);
  const { formatPrice } = useLocalizedCurrency();

  // Get user location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // In a real app, you'd reverse geocode to get city name
            setLocation({
              lat: latitude,
              lng: longitude,
              city: 'Kathmandu' // Default for Nepal
            });
          } catch (error) {
            console.error('Failed to get location:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Set default location
          setLocation({ city: 'Kathmandu' });
        }
      );
    } else {
      setLocation({ city: 'Kathmandu' });
    }
  }, []);

  // Handle search predictions
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performPredictiveSearch(debouncedQuery);
    } else {
      setPredictions([]);
      setCorrections(null);
    }
  }, [debouncedQuery, location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performPredictiveSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/search-predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          location,
          sessionId,
          userId: null, // TODO: Get from auth context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || []);
        setPopularSearches(data.popularSearches || []);
        setCorrections(data.corrections);
        setIsOpen(true);
        
        // Track search performed
        trackSearchAnalytics('search_performed', {
          query: searchQuery,
          resultCount: data.predictions?.length || 0
        });
      }
    } catch (error) {
      console.error('Search prediction error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackSearchAnalytics = async (action: string, data: any) => {
    try {
      await fetch('/api/ai/search-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          sessionId,
          ...data,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const handleSearch = useCallback((searchQuery: string = query) => {
    if (searchQuery.trim()) {
      const finalQuery = corrections?.corrected || searchQuery;
      router.push(`/search?q=${encodeURIComponent(finalQuery)}&location=${location?.city || ''}`);
      setIsOpen(false);
      
      // Track successful search
      trackSearchAnalytics('result_clicked', {
        query: finalQuery,
        resultId: 'search_page'
      });

      // Callback for parent component
      if (onSearchPerformed) {
        onSearchPerformed(finalQuery, predictions);
      }
    }
  }, [query, corrections, router, location, predictions, onSearchPerformed]);

  const handlePredictionClick = (prediction: SearchPrediction, index: number) => {
    if (prediction.type === 'service' && prediction.slug) {
      router.push(`/services/${prediction.slug}`);
    } else if (prediction.type === 'category') {
      router.push(`/services?category=${encodeURIComponent(prediction.category)}&location=${location?.city || ''}`);
    } else {
      handleSearch(prediction.title);
    }

    // Track result click
    trackSearchAnalytics('result_clicked', {
      query,
      resultId: prediction.id,
      position: index
    });

    setIsOpen(false);
  };

  const handleVoiceSearch = (transcript: string) => {
    setQuery(transcript);
    setIsVoiceActive(false);
    if (transcript.trim()) {
      handleSearch(transcript);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleCorrectionAccept = () => {
    if (corrections) {
      setQuery(corrections.corrected);
      trackSearchAnalytics('query_corrected', {
        query: corrections.original,
        correctedQuery: corrections.corrected
      });
    }
  };

  const renderPrediction = (prediction: SearchPrediction, index: number) => (
    <motion.div
      key={`${prediction.id}-${index}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="px-4 py-3 hover:bg-gray-50 cursor-pointer group transition-colors duration-200"
      onClick={() => handlePredictionClick(prediction, index)}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {prediction.type === 'service' && (
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Search className="h-4 w-4 text-blue-600" />
            </div>
          )}
          {prediction.type === 'category' && (
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          )}
          {prediction.type === 'popular' && (
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900 truncate">
              {prediction.title}
            </span>
            {prediction.price && (
              <span className="text-sm text-blue-600 font-medium">
                {formatPrice(prediction.price)}
              </span>
            )}
          </div>
          {prediction.description && (
            <p className="text-xs text-gray-500 truncate mt-1">
              {prediction.description}
            </p>
          )}
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {prediction.category}
            </Badge>
            {prediction.city && (
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="h-3 w-3 mr-1" />
                {prediction.city}
              </div>
            )}
            {prediction.count && (
              <span className="text-xs text-gray-500">
                {prediction.count} searches
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-20 py-3 w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-colors duration-200"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {showVoiceSearch && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsVoiceActive(!isVoiceActive)}
            >
              {isVoiceActive ? (
                <MicOff className="h-4 w-4 text-red-500" />
              ) : (
                <Mic className="h-4 w-4 text-gray-400 hover:text-blue-500" />
              )}
            </Button>
          )}
          
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
                trackSearchAnalytics('search_abandoned', { query });
              }}
            >
              <X className="h-4 w-4 text-gray-400" />
            </Button>
          )}
        </div>
      </div>

      {/* Voice Search Interface */}
      <AnimatePresence>
        {isVoiceActive && (
          <VoiceSearchInterface
            isActive={isVoiceActive}
            onResult={handleVoiceSearch}
            onClose={() => setIsVoiceActive(false)}
            language="en"
          />
        )}
      </AnimatePresence>

      {/* Search Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto"
          >
            {/* Typo Correction */}
            {corrections && (
              <div className="px-4 py-3 bg-blue-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      Did you mean: <button
                        onClick={handleCorrectionAccept}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        {corrections.corrected}
                      </button>?
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(corrections.confidence * 100)}% confident
                  </Badge>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="px-4 py-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm text-gray-500">Searching...</p>
              </div>
            )}

            {/* Search Predictions */}
            {!isLoading && predictions.length > 0 && (
              <>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Suggestions
                  </h3>
                </div>
                {predictions.map((prediction, index) => renderPrediction(prediction, index))}
              </>
            )}

            {/* Popular Searches */}
            {!isLoading && popularSearches.length > 0 && query.length < 2 && (
              <>
                <Separator />
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Popular Searches
                  </h3>
                </div>
                {popularSearches.map((search, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between group"
                    onClick={() => handleSearch(search.query)}
                  >
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-900">{search.query}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {search.count}
                    </Badge>
                  </div>
                ))}
              </>
            )}

            {/* No Results */}
            {!isLoading && predictions.length === 0 && query.length >= 2 && (
              <div className="px-4 py-8 text-center">
                <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No suggestions found</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => handleSearch()}
                >
                  Search anyway
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}