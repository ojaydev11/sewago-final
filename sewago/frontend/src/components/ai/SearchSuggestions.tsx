'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, Clock, Star, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalizedCurrency } from '@/hooks/useLocalizedCurrency';

interface Suggestion {
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

interface SearchSuggestionsProps {
  query: string;
  userId?: string | null;
  location?: string;
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
  limit?: number;
}

export function SearchSuggestions({
  query,
  userId,
  location,
  onSuggestionClick,
  className = "",
  limit = 8
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { formatPrice } = useLocalizedCurrency();

  useEffect(() => {
    if (query.trim().length > 0) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query, userId, location, limit]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        ...(location && { location }),
        ...(userId && { userId }),
        limit: limit.toString()
      });

      const response = await fetch(`/api/ai/search-autocomplete?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestionIcon = (suggestion: Suggestion) => {
    switch (suggestion.type) {
      case 'service':
        return <Search className="h-4 w-4 text-blue-500" />;
      case 'category':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'popular':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'personal':
        return <Clock className="h-4 w-4 text-purple-500" />;
      case 'personalized_service':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSuggestionBadge = (suggestion: Suggestion) => {
    switch (suggestion.type) {
      case 'popular':
        return <Badge variant="secondary" className="text-xs">Popular</Badge>;
      case 'personal':
        return <Badge variant="outline" className="text-xs">History</Badge>;
      case 'personalized_service':
        return <Badge variant="default" className="text-xs">For You</Badge>;
      case 'category':
        return <Badge variant="secondary" className="text-xs">Category</Badge>;
      default:
        return null;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="font-semibold text-blue-600">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  if (!query.trim()) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg animate-pulse"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : suggestions.length > 0 ? (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-1"
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={`${suggestion.text}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors duration-200 group"
                onClick={() => onSuggestionClick(suggestion.text)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex-shrink-0">
                    {getSuggestionIcon(suggestion)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900 truncate">
                        {highlightMatch(suggestion.text, query)}
                      </span>
                      {suggestion.price && (
                        <span className="text-sm text-blue-600 font-medium">
                          {formatPrice(suggestion.price)}
                        </span>
                      )}
                    </div>
                    
                    {(suggestion.category || suggestion.city) && (
                      <div className="flex items-center space-x-2 mt-1">
                        {suggestion.category && (
                          <span className="text-xs text-gray-500">
                            {suggestion.category}
                          </span>
                        )}
                        {suggestion.city && (
                          <>
                            {suggestion.category && (
                              <span className="text-xs text-gray-300">•</span>
                            )}
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {suggestion.city}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {suggestion.count && (
                    <span className="text-xs text-gray-500">
                      {suggestion.count}
                    </span>
                  )}
                  {getSuggestionBadge(suggestion)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-6"
          >
            <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No suggestions found for "{query}"
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => onSuggestionClick(query)}
            >
              Search anyway
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SmartSuggestionsCardProps {
  userId?: string | null;
  location?: string;
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
}

export function SmartSuggestionsCard({
  userId,
  location,
  onSuggestionClick,
  className = ""
}: SmartSuggestionsCardProps) {
  const [trendingSuggestions, setTrendingSuggestions] = useState<string[]>([]);
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState<string[]>([]);

  useEffect(() => {
    fetchTrendingSuggestions();
    if (userId) {
      fetchPersonalizedSuggestions();
    }
  }, [userId, location]);

  const fetchTrendingSuggestions = async () => {
    try {
      // This would typically fetch from your analytics API
      const trending = [
        'House Cleaning',
        'Electrical Repair',
        'Plumbing Service',
        'Garden Care',
        'AC Repair'
      ];
      setTrendingSuggestions(trending);
    } catch (error) {
      console.error('Failed to fetch trending suggestions:', error);
    }
  };

  const fetchPersonalizedSuggestions = async () => {
    if (!userId) return;
    
    try {
      // This would fetch user's personalized suggestions
      const personalized = [
        'Deep Cleaning',
        'Home Maintenance',
        'Kitchen Repair'
      ];
      setPersonalizedSuggestions(personalized);
    } catch (error) {
      console.error('Failed to fetch personalized suggestions:', error);
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <span>Quick Search</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trending Suggestions */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1 text-orange-500" />
            Trending Now
          </h4>
          <div className="flex flex-wrap gap-2">
            {trendingSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => onSuggestionClick(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {/* Personalized Suggestions */}
        {userId && personalizedSuggestions.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                For You
              </h4>
              <div className="flex flex-wrap gap-2">
                {personalizedSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="default"
                    size="sm"
                    className="text-xs h-8 bg-blue-600 hover:bg-blue-700"
                    onClick={() => onSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}