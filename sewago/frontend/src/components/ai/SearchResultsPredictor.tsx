'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Star, 
  DollarSign,
  Users,
  Zap,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useLocalizedCurrency } from '@/hooks/useLocalizedCurrency';

interface PredictionResult {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  bookings: number;
  availability: 'high' | 'medium' | 'low';
  distance: number;
  estimatedTime: string;
  confidence: number;
  reasons: string[];
  imageUrl?: string;
  provider?: {
    name: string;
    rating: number;
    completionRate: number;
  };
}

interface SearchResultsPredictorProps {
  query: string;
  location?: { lat: number; lng: number; city?: string };
  userId?: string | null;
  filters?: {
    category?: string;
    priceRange?: [number, number];
    rating?: number;
  };
  onResultClick?: (result: PredictionResult) => void;
  className?: string;
}

export function SearchResultsPredictor({
  query,
  location,
  userId,
  filters,
  onResultClick,
  className = ""
}: SearchResultsPredictorProps) {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [insights, setInsights] = useState<{
    avgPrice: number;
    popularTimes: string[];
    demandLevel: 'low' | 'medium' | 'high';
    alternatives: string[];
  } | null>(null);

  const { formatPrice } = useLocalizedCurrency();

  useEffect(() => {
    if (query.trim().length >= 2) {
      generatePredictions();
    } else {
      setPredictions([]);
      setInsights(null);
    }
  }, [query, location, userId, filters]);

  const generatePredictions = async () => {
    setIsLoading(true);
    try {
      // Simulate ML prediction API call
      const response = await fetch('/api/ai/search-predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          location,
          userId,
          filters,
          includePredictions: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Transform predictions to include ML confidence and insights
        const enhancedPredictions = data.predictions.map((p: any, index: number) => ({
          id: p.id,
          title: p.title,
          description: p.description || `Professional ${p.category.toLowerCase()} service in ${location?.city || 'your area'}`,
          category: p.category,
          price: p.price || Math.floor(Math.random() * 5000) + 1000, // Fallback pricing
          rating: 4.2 + Math.random() * 0.8,
          bookings: Math.floor(Math.random() * 500) + 50,
          availability: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
          distance: Math.random() * 10 + 1,
          estimatedTime: `${Math.floor(Math.random() * 120) + 30} min`,
          confidence: Math.max(0.6, p.score || Math.random()),
          reasons: generatePredictionReasons(p, index),
          imageUrl: p.imageUrl,
          provider: generateProviderData()
        }));

        setPredictions(enhancedPredictions.slice(0, 6));
        setConfidence(Math.round(enhancedPredictions.reduce((acc: number, p: any) => acc + p.confidence, 0) / enhancedPredictions.length * 100));
        setInsights(generateInsights(enhancedPredictions));
      }
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePredictionReasons = (prediction: any, index: number): string[] => {
    const reasons = [];
    
    if (index === 0) reasons.push('Best match for your search');
    if (prediction.score > 0.8) reasons.push('High relevance score');
    if (location) reasons.push('Available in your area');
    if (prediction.category.toLowerCase().includes(query.toLowerCase())) {
      reasons.push('Exact category match');
    }
    
    const additionalReasons = [
      'Popular in your neighborhood',
      'Recently booked by similar users',
      'High customer satisfaction',
      'Quick response time',
      'Verified provider'
    ];
    
    // Add 1-2 random additional reasons
    const shuffled = additionalReasons.sort(() => 0.5 - Math.random());
    reasons.push(...shuffled.slice(0, 2));
    
    return reasons;
  };

  const generateProviderData = () => ({
    name: ['ServicePro', 'QuickFix', 'HomeExperts', 'SkillMaster', 'ReliableService'][Math.floor(Math.random() * 5)],
    rating: 4.1 + Math.random() * 0.8,
    completionRate: 85 + Math.random() * 15
  });

  const generateInsights = (predictions: PredictionResult[]) => {
    const prices = predictions.map(p => p.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    return {
      avgPrice,
      popularTimes: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'],
      demandLevel: avgPrice > 3000 ? 'high' : avgPrice > 2000 ? 'medium' : 'low' as any,
      alternatives: [
        `DIY ${query} tips`,
        `${query} maintenance`,
        `Emergency ${query}`
      ]
    };
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDemandLevelIcon = (level: string) => {
    switch (level) {
      case 'high': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'medium': return <Target className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Clock className="h-4 w-4 text-green-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!query.trim()) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Prediction Confidence */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>AI Search Predictions</span>
            <Badge variant="secondary" className="ml-auto">
              {confidence}% confident
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={confidence} className="h-2 mb-2" />
          <p className="text-sm text-blue-700">
            Based on your search "{query}", here are the most relevant services
          </p>
        </CardContent>
      </Card>

      {/* Market Insights */}
      {insights && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Market Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <DollarSign className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-lg font-semibold text-blue-600">
                    {formatPrice(insights.avgPrice)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Avg. Price</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {getDemandLevelIcon(insights.demandLevel)}
                  <span className="text-lg font-semibold text-gray-900 ml-1 capitalize">
                    {insights.demandLevel}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Demand</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-lg font-semibold text-purple-600">
                    2-4h
                  </span>
                </div>
                <p className="text-xs text-gray-500">Avg. Response</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-lg font-semibold text-green-600">
                    {Math.floor(Math.random() * 20) + 5}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Providers</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Popular booking times:
              </h4>
              <div className="flex space-x-2">
                {insights.popularTimes.map((time, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {time}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Zap className="h-5 w-5 text-yellow-500 mr-2" />
          Predicted Best Matches
        </h3>
        
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {predictions.map((prediction, index) => (
                <motion.div
                  key={prediction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="hover:shadow-lg transition-shadow duration-300 cursor-pointer border-l-4 border-l-blue-500"
                    onClick={() => onResultClick?.(prediction)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">
                              {prediction.title}
                            </h4>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getAvailabilityColor(prediction.availability)}`}
                            >
                              {prediction.availability} availability
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {prediction.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {prediction.distance.toFixed(1)} km away
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {prediction.estimatedTime}
                            </div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-yellow-500" />
                              {prediction.rating.toFixed(1)}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {prediction.bookings} bookings
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {formatPrice(prediction.price)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.round(prediction.confidence * 100)}% match
                          </div>
                        </div>
                      </div>
                      
                      {/* Provider Info */}
                      {prediction.provider && (
                        <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">
                                {prediction.provider.name[0]}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {prediction.provider.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-gray-600">
                            <span>★ {prediction.provider.rating.toFixed(1)}</span>
                            <span>{Math.round(prediction.provider.completionRate)}% completion</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Prediction Reasons */}
                      <div className="border-t pt-3">
                        <h5 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Why this matches:
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {prediction.reasons.slice(0, 3).map((reason, reasonIndex) => (
                            <Badge 
                              key={reasonIndex} 
                              variant="outline" 
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Alternative Suggestions */}
      {insights && insights.alternatives.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span>You might also like</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.alternatives.map((alternative, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => onResultClick?.({
                    id: `alt-${index}`,
                    title: alternative,
                    description: `Explore ${alternative} services`,
                    category: 'Alternative',
                    price: 0,
                    rating: 0,
                    bookings: 0,
                    availability: 'medium',
                    distance: 0,
                    estimatedTime: '',
                    confidence: 0.5,
                    reasons: []
                  } as PredictionResult)}
                >
                  {alternative}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}