'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Heart, 
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Sparkles,
  Info
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface ServiceRecommendation {
  serviceId: string;
  name: string;
  category: string;
  basePrice: number;
  imageUrl?: string;
  score: number;
  reason: string;
  algorithm: 'collaborative' | 'content' | 'location' | 'hybrid';
  metadata?: {
    category: string;
    avgRating: number;
    bookingCount: number;
    area?: string;
    localPopularity?: number;
    seasonal?: boolean;
    festival?: string;
  };
  distance?: number;
}

interface SmartServiceGridProps {
  userId: string;
  recommendations: ServiceRecommendation[];
  title?: string;
  subtitle?: string;
  showExplanations?: boolean;
  onServiceSelect?: (serviceId: string) => void;
  className?: string;
}

export function SmartServiceGrid({
  userId,
  recommendations,
  title = "Recommended Services",
  subtitle,
  showExplanations = true,
  onServiceSelect,
  className = ""
}: SmartServiceGridProps) {
  const [feedbackState, setFeedbackState] = useState<Record<string, 'liked' | 'disliked' | null>>({});
  const [loadingFeedback, setLoadingFeedback] = useState<Record<string, boolean>>({});

  const handleServiceClick = async (service: ServiceRecommendation) => {
    // Track service view
    await trackBehavior({
      action: 'view',
      serviceId: service.serviceId,
      category: service.category,
      metadata: {
        recommendationScore: service.score,
        algorithm: service.algorithm,
        reason: service.reason
      }
    });

    if (onServiceSelect) {
      onServiceSelect(service.serviceId);
    } else {
      // Default navigation to service detail page
      window.location.href = `/services/${service.serviceId}`;
    }
  };

  const handleFeedback = async (serviceId: string, feedback: 'liked' | 'disliked') => {
    if (loadingFeedback[serviceId]) return;

    setLoadingFeedback(prev => ({ ...prev, [serviceId]: true }));
    
    try {
      await fetch('/api/personalization/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          serviceId,
          feedback,
          recommendationId: `rec_${serviceId}_${Date.now()}`
        })
      });

      setFeedbackState(prev => ({ ...prev, [serviceId]: feedback }));
      
      // Track feedback behavior
      await trackBehavior({
        action: 'click',
        serviceId,
        clickTarget: `recommendation_${feedback}`,
        metadata: { feedback }
      });
    } catch (error) {
      console.error('Failed to record feedback:', error);
    } finally {
      setLoadingFeedback(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  const trackBehavior = async (event: any) => {
    try {
      await fetch('/api/personalization/behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          event
        })
      });
    } catch (error) {
      console.error('Failed to track behavior:', error);
    }
  };

  const getAlgorithmBadge = (algorithm: string) => {
    const badges = {
      collaborative: { label: 'Similar Users', color: 'bg-blue-100 text-blue-700', icon: '👥' },
      content: { label: 'Your Interests', color: 'bg-green-100 text-green-700', icon: '🎯' },
      location: { label: 'Nearby', color: 'bg-orange-100 text-orange-700', icon: '📍' },
      hybrid: { label: 'AI Match', color: 'bg-purple-100 text-purple-700', icon: '🤖' }
    };
    
    return badges[algorithm as keyof typeof badges] || badges.hybrid;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (recommendations.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Recommendations Yet</h3>
          <p className="text-gray-500">
            Use SewaGo more to get personalized service recommendations!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          
          {showExplanations && (
            <Badge variant="outline" className="text-xs">
              <Info className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recommendations.map((service, index) => {
            const algorithmBadge = getAlgorithmBadge(service.algorithm);
            const userFeedback = feedbackState[service.serviceId];
            
            return (
              <motion.div
                key={service.serviceId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className="group"
              >
                <Card className="h-full cursor-pointer transition-all duration-200 hover:shadow-lg border-2 hover:border-blue-200">
                  <div className="relative">
                    {/* Service Image */}
                    <div 
                      className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden"
                      onClick={() => handleServiceClick(service)}
                    >
                      {service.imageUrl ? (
                        <img 
                          src={service.imageUrl}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <BookOpen className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Algorithm Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className={`text-xs ${algorithmBadge.color} border-none`}>
                        <span className="mr-1">{algorithmBadge.icon}</span>
                        {algorithmBadge.label}
                      </Badge>
                    </div>

                    {/* Confidence Score */}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/90 text-xs">
                        <TrendingUp className={`w-3 h-3 mr-1 ${getConfidenceColor(service.score)}`} />
                        {Math.round(service.score * 100)}%
                      </Badge>
                    </div>

                    {/* Seasonal/Festival Badge */}
                    {service.metadata?.seasonal && (
                      <div className="absolute bottom-2 left-2">
                        <Badge className="bg-orange-100 text-orange-700 text-xs">
                          🎉 {service.metadata.festival || 'Seasonal'}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div onClick={() => handleServiceClick(service)} className="cursor-pointer">
                      {/* Service Info */}
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {service.name}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-2">{service.category}</p>

                      {/* Price and Rating */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(service.basePrice)}
                        </span>
                        
                        {service.metadata?.avgRating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">
                              {service.metadata.avgRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Additional Info */}
                      <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                        {service.metadata?.area && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {service.metadata.area}
                          </div>
                        )}
                        
                        {service.distance && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {service.distance.toFixed(1)}km
                          </div>
                        )}
                        
                        {service.metadata?.bookingCount && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {service.metadata.bookingCount} bookings
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recommendation Reason */}
                    {showExplanations && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded italic">
                          💡 {service.reason}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <Button 
                        size="sm" 
                        className="flex-1 mr-2"
                        onClick={() => handleServiceClick(service)}
                      >
                        Book Now
                      </Button>
                      
                      {/* Feedback Buttons */}
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={userFeedback === 'liked' ? 'default' : 'outline'}
                          onClick={() => handleFeedback(service.serviceId, 'liked')}
                          disabled={loadingFeedback[service.serviceId]}
                          className="p-2"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant={userFeedback === 'disliked' ? 'destructive' : 'outline'}
                          onClick={() => handleFeedback(service.serviceId, 'disliked')}
                          disabled={loadingFeedback[service.serviceId]}
                          className="p-2"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Load More Button */}
        {recommendations.length >= 8 && (
          <div className="text-center mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                // Load more recommendations
                console.log('Load more recommendations');
              }}
            >
              Show More Recommendations
            </Button>
          </div>
        )}

        {/* Algorithm Explanation */}
        {showExplanations && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              How We Choose These for You
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span>👥</span>
                <span className="text-blue-700">Similar user preferences</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎯</span>
                <span className="text-blue-700">Your service history</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span className="text-blue-700">Location popularity</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🤖</span>
                <span className="text-blue-700">AI pattern matching</span>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}