'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
// Mock useIntl hook for development
const useIntl = () => ({
  formatMessage: (descriptor: { id: string; defaultMessage?: string }, values?: any) => {
    if (values && values.name) {
      return `Welcome, ${values.name}`;
    }
    return descriptor.defaultMessage || descriptor.id;
  },
  formatDate: (date: Date) => date.toLocaleDateString(),
  formatTime: (date: Date) => date.toLocaleTimeString(),
  formatNumber: (num: number) => num.toLocaleString(),
  locale: 'en'
});
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ServiceRecommendation, ProviderRecommendation, PersonalizedOffer } from '@/types/personalization';
import {
  Star,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar,
  Users,
  Gift,
  Zap,
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  Eye,
} from 'lucide-react';

interface RecommendationCarouselProps {
  userId: string;
  className?: string;
  type: 'services' | 'providers' | 'offers' | 'mixed';
  autoPlay?: boolean;
  autoPlayInterval?: number;
  itemsPerView?: number;
  showControls?: boolean;
  onItemClick?: (item: any, type: string) => void;
  onItemBook?: (item: any, type: string) => void;
  onItemFavorite?: (item: any, type: string) => void;
}

export function RecommendationCarousel({
  userId,
  className = '',
  type = 'services',
  autoPlay = true,
  autoPlayInterval = 5000,
  itemsPerView = 3,
  showControls = true,
  onItemClick,
  onItemBook,
  onItemFavorite,
}: RecommendationCarouselProps) {
  const intl = useIntl();
  const [items, setItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadRecommendations();
  }, [userId, type]);

  useEffect(() => {
    if (isPlaying && items.length > itemsPerView) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % Math.max(1, items.length - itemsPerView + 1));
      }, autoPlayInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, items.length, itemsPerView, autoPlayInterval]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      let data: any[] = [];

      if (type === 'mixed') {
        // Load all types and mix them
        const [servicesResponse, providersResponse, offersResponse] = await Promise.all([
          fetch(`/api/personalization/recommendations?userId=${userId}&limit=6`),
          fetch(`/api/personalization/recommendations?userId=${userId}&limit=4`),
          fetch(`/api/personalization/dashboard?userId=${userId}`),
        ]);

        const [servicesResult, providersResult, offersResult] = await Promise.all([
          servicesResponse.json(),
          providersResponse.json(),
          offersResponse.json(),
        ]);

        const services = (servicesResult.data?.services || []).map((item: any) => ({ ...item, itemType: 'service' }));
        const providers = (providersResult.data?.providers || []).map((item: any) => ({ ...item, itemType: 'provider' }));
        const offers = (offersResult.data?.recommendations?.offers || []).map((item: any) => ({ ...item, itemType: 'offer' }));

        // Mix and shuffle items
        data = [...services.slice(0, 4), ...providers.slice(0, 2), ...offers.slice(0, 2)];
        data = shuffleArray(data);
      } else {
        const response = await fetch(`/api/personalization/recommendations?userId=${userId}&limit=12`);
        const result = await response.json();

        if (result.success) {
          switch (type) {
            case 'services':
              data = (result.data.services || []).map((item: any) => ({ ...item, itemType: 'service' }));
              break;
            case 'providers':
              data = (result.data.providers || []).map((item: any) => ({ ...item, itemType: 'provider' }));
              break;
            case 'offers':
              // Get offers from dashboard endpoint
              const offersResponse = await fetch(`/api/personalization/dashboard?userId=${userId}`);
              const offersResult = await offersResponse.json();
              data = (offersResult.data?.recommendations?.offers || []).map((item: any) => ({ ...item, itemType: 'offer' }));
              break;
          }
        } else {
          setError(result.error || 'Failed to load recommendations');
          return;
        }
      }

      setItems(data);
      setError(null);
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: string, item: any) => {
    // Track user behavior
    fetch('/api/personalization/behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action,
        serviceId: item.itemType === 'service' ? item.id : undefined,
        providerId: item.itemType === 'provider' ? item.id : undefined,
        category: item.category || 'carousel',
        clickTarget: `carousel_${item.itemType}`,
      }),
    }).catch(console.error);

    // Handle specific actions
    switch (action) {
      case 'view':
        onItemClick?.(item, item.itemType);
        break;
      case 'book':
        onItemBook?.(item, item.itemType);
        break;
      case 'favorite':
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          if (newFavorites.has(item.id)) {
            newFavorites.delete(item.id);
          } else {
            newFavorites.add(item.id);
          }
          return newFavorites;
        });
        onItemFavorite?.(item, item.itemType);
        break;
    }
  };

  const navigateToIndex = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, items.length - itemsPerView)));
    setIsPlaying(false); // Pause auto-play when user manually navigates
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold && currentIndex > 0) {
      navigateToIndex(currentIndex - 1);
    } else if (info.offset.x < -threshold && currentIndex < items.length - itemsPerView) {
      navigateToIndex(currentIndex + 1);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetCarousel = () => {
    setCurrentIndex(0);
    setIsPlaying(autoPlay);
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <CarouselSkeleton itemsPerView={itemsPerView} />
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <div className="text-gray-500 space-y-2">
            <Eye className="h-8 w-8 mx-auto opacity-50" />
            <p className="text-sm">
              {error || intl.formatMessage({ id: 'carousel.noRecommendations' })}
            </p>
            <Button variant="outline" onClick={loadRecommendations} size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              {intl.formatMessage({ id: 'common.retry' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxIndex = Math.max(0, items.length - itemsPerView);
  const visibleItems = items.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              {intl.formatMessage({ id: `carousel.title.${type}` })}
            </CardTitle>
            <CardDescription>
              {intl.formatMessage(
                { id: `carousel.description.${type}` },
                { count: items.length }
              )}
            </CardDescription>
          </div>
          
          {showControls && items.length > itemsPerView && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayPause}
                className="p-2"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetCarousel}
                className="p-2"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-6">
        <div className="relative">
          {/* Navigation Arrows */}
          {showControls && items.length > itemsPerView && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute -left-4 top-1/2 z-10 transform -translate-y-1/2 p-2 shadow-lg"
                onClick={() => navigateToIndex(currentIndex - 1)}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="absolute -right-4 top-1/2 z-10 transform -translate-y-1/2 p-2 shadow-lg"
                onClick={() => navigateToIndex(currentIndex + 1)}
                disabled={currentIndex >= maxIndex}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Carousel Container */}
          <motion.div
            ref={containerRef}
            className="overflow-hidden"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
          >
            <motion.div
              className="flex space-x-4"
              animate={{ x: `-${(currentIndex * 100) / itemsPerView}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ width: `${(items.length * 100) / itemsPerView}%` }}
            >
              {items.map((item, index) => (
                <motion.div
                  key={`${item.itemType}-${item.id}`}
                  className="flex-shrink-0"
                  style={{ width: `${100 / items.length}%` }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item.itemType === 'service' && (
                    <ServiceCarouselItem
                      service={item}
                      isFavorited={favorites.has(item.id)}
                      onAction={handleAction}
                    />
                  )}
                  {item.itemType === 'provider' && (
                    <ProviderCarouselItem
                      provider={item}
                      isFavorited={favorites.has(item.id)}
                      onAction={handleAction}
                    />
                  )}
                  {item.itemType === 'offer' && (
                    <OfferCarouselItem
                      offer={item}
                      onAction={handleAction}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Pagination Dots */}
        {showControls && items.length > itemsPerView && (
          <div className="flex justify-center space-x-1 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  currentIndex === index
                    ? 'bg-blue-500 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => navigateToIndex(index)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Service Carousel Item
function ServiceCarouselItem({
  service,
  isFavorited,
  onAction,
}: {
  service: ServiceRecommendation & { itemType: string };
  isFavorited: boolean;
  onAction: (action: string, item: any) => void;
}) {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
      {/* Service Header */}
      <div className="relative h-32 bg-gradient-to-br from-blue-50 to-purple-50">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-2xl text-blue-200">
              {service.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        
        {/* Confidence Badge */}
        <Badge
          variant="secondary"
          className="absolute top-2 left-2 text-xs bg-white/90 text-blue-700"
        >
          {Math.round(service.confidence * 100)}% match
        </Badge>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1"
          onClick={(e) => {
            e.stopPropagation();
            onAction('favorite', service);
          }}
        >
          <Heart className={`h-3 w-3 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </Button>
      </div>

      <CardContent className="p-3 space-y-2" onClick={() => onAction('view', service)}>
        {/* Service Info */}
        <div>
          <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
            {service.name}
          </h4>
          <p className="text-xs text-gray-600 line-clamp-2">
            {service.description}
          </p>
        </div>

        {/* Metrics */}
        <div className="flex items-center space-x-3 text-xs text-gray-600">
          <div className="flex items-center">
            <Star className="h-3 w-3 mr-1 text-yellow-500" />
            {service.rating.toFixed(1)}
          </div>
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {service.reviewCount}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-green-600">
            NPR {service.estimatedPrice.toLocaleString()}
          </div>
          <Button
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onAction('book', service);
            }}
          >
            Book
          </Button>
        </div>

        {/* Reasoning */}
        <p className="text-xs text-blue-600 italic line-clamp-1">
          {service.reasoning}
        </p>
      </CardContent>
    </Card>
  );
}

// Provider Carousel Item
function ProviderCarouselItem({
  provider,
  isFavorited,
  onAction,
}: {
  provider: ProviderRecommendation & { itemType: string };
  isFavorited: boolean;
  onAction: (action: string, item: any) => void;
}) {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <CardContent className="p-3 space-y-3" onClick={() => onAction('view', provider)}>
        {/* Provider Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-semibold text-purple-700">
              {provider.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
              {provider.name}
            </h4>
            <Badge variant="outline" className="text-xs">
              {Math.round(provider.confidence * 100)}% match
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={(e) => {
              e.stopPropagation();
              onAction('favorite', provider);
            }}
          >
            <Heart className={`h-3 w-3 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </Button>
        </div>

        {/* Provider Metrics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              {provider.rating.toFixed(1)}
            </div>
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {provider.reviewCount}
            </div>
            {provider.distance && (
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {(provider.distance / 1000).toFixed(1)}km
              </div>
            )}
          </div>

          {/* Services */}
          <div className="flex flex-wrap gap-1">
            {provider.services.slice(0, 2).map(service => (
              <Badge key={service} variant="outline" className="text-xs">
                {service}
              </Badge>
            ))}
            {provider.services.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{provider.services.length - 2}
              </Badge>
            )}
          </div>

          {/* Action Button */}
          <Button
            className="w-full h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onAction('book', provider);
            }}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Offer Carousel Item
function OfferCarouselItem({
  offer,
  onAction,
}: {
  offer: PersonalizedOffer & { itemType: string };
  onAction: (action: string, item: any) => void;
}) {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group bg-gradient-to-br from-green-50 to-blue-50">
      <CardContent className="p-3 space-y-3" onClick={() => onAction('view', offer)}>
        {/* Offer Header */}
        <div className="flex items-start justify-between">
          <Gift className="h-6 w-6 text-green-500 flex-shrink-0" />
          <Badge className="bg-green-500 text-white text-xs">
            {offer.discountPercentage}% OFF
          </Badge>
        </div>

        {/* Offer Info */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
            {offer.title}
          </h4>
          <p className="text-xs text-gray-600 line-clamp-2">
            {offer.description}
          </p>
        </div>

        {/* Offer Details */}
        <div className="space-y-2">
          <div className="text-xs text-gray-500">
            Valid until: {new Date(offer.validUntil).toLocaleDateString()}
          </div>
          
          {/* Services */}
          <div className="flex flex-wrap gap-1">
            {offer.services.slice(0, 2).map(service => (
              <Badge key={service} variant="outline" className="text-xs">
                {service}
              </Badge>
            ))}
            {offer.services.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{offer.services.length - 2}
              </Badge>
            )}
          </div>

          {/* Cultural Context */}
          {offer.culturalContext && (
            <div className="text-xs text-purple-600 italic">
              {offer.culturalContext.festival} Special
            </div>
          )}

          {/* Action Button */}
          <Button
            variant="outline"
            className="w-full h-7 text-xs border-green-300 hover:bg-green-50"
            onClick={(e) => {
              e.stopPropagation();
              onAction('view', offer);
            }}
          >
            <Gift className="h-3 w-3 mr-1" />
            Claim Offer
          </Button>
        </div>

        {/* Targeting Reason */}
        <p className="text-xs text-blue-600 italic line-clamp-1">
          {offer.targetingReason}
        </p>
      </CardContent>
    </Card>
  );
}

// Loading Skeleton
function CarouselSkeleton({ itemsPerView }: { itemsPerView: number }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4">
          {Array.from({ length: itemsPerView }).map((_, i) => (
            <div key={i} className="flex-1 space-y-3">
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2 p-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Utility function
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}