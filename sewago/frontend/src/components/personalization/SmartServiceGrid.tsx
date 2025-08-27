'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ServiceRecommendation, RecommendationRequest } from '@/types/personalization';
import {
  Star,
  MapPin,
  Clock,
  Filter,
  Search,
  Zap,
  TrendingUp,
  Heart,
  Bookmark,
  Calendar,
  CreditCard,
  Users,
  Award,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  Grid3X3,
  List,
} from 'lucide-react';

interface SmartServiceGridProps {
  userId: string;
  className?: string;
  initialFilter?: {
    categories?: string[];
    location?: { lat: number; lng: number; area?: string };
    budget?: { min?: number; max?: number };
    algorithm?: 'collaborative' | 'content' | 'hybrid' | 'location' | 'seasonal';
  };
  onServiceSelect?: (service: ServiceRecommendation) => void;
  onServiceBook?: (service: ServiceRecommendation) => void;
  onServiceFavorite?: (service: ServiceRecommendation) => void;
}

export function SmartServiceGrid({
  userId,
  className = '',
  initialFilter = {},
  onServiceSelect,
  onServiceBook,
  onServiceFavorite,
}: SmartServiceGridProps) {
  const intl = useIntl();
  const [services, setServices] = useState<ServiceRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(initialFilter.algorithm || 'hybrid');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<'confidence' | 'price' | 'rating'>('confidence');
  const [showFilters, setShowFilters] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecommendations();
  }, [userId, selectedAlgorithm]);

  const loadRecommendations = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams({
        userId,
        algorithm: selectedAlgorithm,
        limit: '20',
      });

      if (initialFilter.categories?.length) {
        params.append('categories', initialFilter.categories.join(','));
      }

      if (initialFilter.location) {
        params.append('lat', initialFilter.location.lat.toString());
        params.append('lng', initialFilter.location.lng.toString());
        if (initialFilter.location.area) {
          params.append('area', initialFilter.location.area);
        }
      }

      if (initialFilter.budget) {
        if (initialFilter.budget.min) {
          params.append('budgetMin', initialFilter.budget.min.toString());
        }
        if (initialFilter.budget.max) {
          params.append('budgetMax', initialFilter.budget.max.toString());
        }
      }

      const response = await fetch(`/api/personalization/recommendations?${params}`);
      const result = await response.json();

      if (result.success) {
        setServices(result.data.services || []);
        setError(null);
      } else {
        setError(result.error || 'Failed to load recommendations');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredAndSortedServices = useMemo(() => {
    let filtered = services;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Apply price filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(service => {
        const price = service.estimatedPrice;
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Sort services
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.estimatedPrice - b.estimatedPrice;
        case 'rating':
          return b.rating - a.rating;
        case 'confidence':
        default:
          return b.confidence - a.confidence;
      }
    });

    return filtered;
  }, [services, searchQuery, selectedCategory, priceRange, sortBy]);

  const handleServiceAction = (action: string, service: ServiceRecommendation) => {
    // Track user behavior
    fetch('/api/personalization/behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action,
        serviceId: service.id,
        category: service.category,
      }),
    }).catch(console.error);

    // Handle specific actions
    switch (action) {
      case 'view':
        onServiceSelect?.(service);
        break;
      case 'book':
        onServiceBook?.(service);
        break;
      case 'favorite':
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          if (newFavorites.has(service.id)) {
            newFavorites.delete(service.id);
          } else {
            newFavorites.add(service.id);
          }
          return newFavorites;
        });
        onServiceFavorite?.(service);
        break;
    }
  };

  const categories = useMemo(() => {
    const categorySet = new Set(services.map(service => service.category));
    return Array.from(categorySet);
  }, [services]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <GridSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="text-center space-y-4">
          <div className="text-red-500 text-sm">{error}</div>
          <Button onClick={() => loadRecommendations()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {intl.formatMessage({ id: 'common.retry' })}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-blue-500" />
                {intl.formatMessage({ id: 'smartGrid.title' })}
              </CardTitle>
              <CardDescription>
                {intl.formatMessage({ 
                  id: 'smartGrid.description' 
                }, { 
                  count: filteredAndSortedServices.length,
                  algorithm: selectedAlgorithm 
                })}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadRecommendations(true)}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {intl.formatMessage({ id: 'common.refresh' })}
              </Button>
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className="px-3"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="px-3"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and Primary Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={intl.formatMessage({ id: 'smartGrid.searchPlaceholder' })}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hybrid">Smart Mix</SelectItem>
                <SelectItem value="collaborative">Similar Users</SelectItem>
                <SelectItem value="content">Your Preferences</SelectItem>
                <SelectItem value="location">Nearby Services</SelectItem>
                <SelectItem value="seasonal">Trending Now</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="whitespace-nowrap"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range (NPR)</label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      type="number"
                    />
                    <Input
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      type="number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confidence">Best Match</SelectItem>
                      <SelectItem value="price">Price: Low to High</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setPriceRange({ min: '', max: '' });
                      setSortBy('confidence');
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Service Grid/List */}
      {filteredAndSortedServices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-500 space-y-2">
              <Search className="h-12 w-12 mx-auto opacity-50" />
              <p>{intl.formatMessage({ id: 'smartGrid.noResults' })}</p>
              <p className="text-sm">
                {intl.formatMessage({ id: 'smartGrid.noResultsHint' })}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          <AnimatePresence>
            {filteredAndSortedServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                {viewMode === 'grid' ? (
                  <ServiceCard
                    service={service}
                    isFavorited={favorites.has(service.id)}
                    onAction={handleServiceAction}
                  />
                ) : (
                  <ServiceListItem
                    service={service}
                    isFavorited={favorites.has(service.id)}
                    onAction={handleServiceAction}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// Service Card Component (Grid View)
function ServiceCard({ 
  service, 
  isFavorited, 
  onAction 
}: { 
  service: ServiceRecommendation; 
  isFavorited: boolean; 
  onAction: (action: string, service: ServiceRecommendation) => void; 
}) {
  const intl = useIntl();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
      {/* Service Image/Header */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50">
        {service.imageUrl ? (
          <img 
            src={service.imageUrl} 
            alt={service.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-4xl text-blue-200">
              {service.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        
        {/* Confidence Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-blue-700 text-xs">
            {Math.round(service.confidence * 100)}% match
          </Badge>
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2"
          onClick={(e) => {
            e.stopPropagation();
            onAction('favorite', service);
          }}
        >
          <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </Button>
      </div>

      <CardContent className="p-4" onClick={() => onAction('view', service)}>
        {/* Service Info */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
              {service.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {service.description}
            </p>
          </div>

          {/* Metrics */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              {service.rating.toFixed(1)}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {service.reviewCount}
            </div>
            {service.provider?.distance && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {(service.provider.distance / 1000).toFixed(1)}km
              </div>
            )}
          </div>

          {/* Price and Availability */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-green-600">
                NPR {service.estimatedPrice.toLocaleString()}
              </div>
              {service.availability.isAvailable && (
                <div className="flex items-center text-xs text-green-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Next: {new Date(service.availability.nextAvailable).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Personalized Factors */}
          <div className="flex flex-wrap gap-1">
            {service.personalizedFactors.pastUsage && (
              <Badge variant="outline" className="text-xs">Used Before</Badge>
            )}
            {service.personalizedFactors.budgetMatch && (
              <Badge variant="outline" className="text-xs">Budget Match</Badge>
            )}
            {service.personalizedFactors.locationMatch && (
              <Badge variant="outline" className="text-xs">Near You</Badge>
            )}
            {service.personalizedFactors.culturalRelevance && (
              <Badge variant="outline" className="text-xs">Culturally Relevant</Badge>
            )}
          </div>

          {/* Reasoning */}
          <p className="text-xs text-blue-600 italic">
            {service.reasoning}
          </p>

          {/* Action Button */}
          <Button 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onAction('book', service);
            }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Service List Item Component (List View)
function ServiceListItem({ 
  service, 
  isFavorited, 
  onAction 
}: { 
  service: ServiceRecommendation; 
  isFavorited: boolean; 
  onAction: (action: string, service: ServiceRecommendation) => void; 
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Service Image */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex-shrink-0">
            {service.imageUrl ? (
              <img 
                src={service.imageUrl} 
                alt={service.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xl text-blue-300">
                {service.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Service Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => onAction('view', service)}>
                  {service.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-1">
                  {service.description}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Badge variant="outline" className="text-xs">
                  {Math.round(service.confidence * 100)}% match
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAction('favorite', service)}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  {service.rating.toFixed(1)}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {service.reviewCount}
                </div>
                {service.provider?.distance && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {(service.provider.distance / 1000).toFixed(1)}km
                  </div>
                )}
                <div className="text-lg font-bold text-green-600">
                  NPR {service.estimatedPrice.toLocaleString()}
                </div>
              </div>

              <Button 
                onClick={() => onAction('book', service)}
                className="ml-4"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Now
              </Button>
            </div>

            <p className="text-xs text-blue-600 italic">
              {service.reasoning}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Skeleton
function GridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="space-y-2 p-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}