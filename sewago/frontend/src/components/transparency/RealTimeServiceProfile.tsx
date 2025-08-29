'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSocket } from '@/hooks/useSocket';
import { useProviderStatus } from '@/hooks/useProviderStatus';
import { formatDistanceToNow } from 'date-fns';
import {
  User,
  Star,
  Clock,
  CheckCircle,
  TrendingUp,
  MapPin,
  Phone,
  MessageCircle,
  Shield,
  Award,
  Activity,
  Calendar,
  DollarSign,
  Users,
  Zap,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface ProviderMetrics {
  responseTime: number; // in minutes
  completionRate: number; // 0-100
  customerSatisfaction: number; // 0-5
  totalBookings: number;
  activeBookings: number;
  averageRating: number;
  reviewCount: number;
  onTimePercentage: number;
  repeatCustomerRate: number;
  lastMonthEarnings: number;
  thisMonthEarnings: number;
  availabilityRate: number;
  cancellationRate: number;
}

interface ServiceCapacity {
  current: number;
  maximum: number;
  upcoming: number;
  nextAvailable: string | null;
  queueLength: number;
  estimatedWaitTime: number;
}

interface RealtimeUpdate {
  timestamp: string;
  type: 'booking' | 'rating' | 'completion' | 'availability';
  data: any;
}

interface RealTimeServiceProfileProps {
  providerId: string;
  showMetrics?: boolean;
  showCapacity?: boolean;
  showRecentActivity?: boolean;
  compact?: boolean;
  refreshInterval?: number;
  className?: string;
}

export default function RealTimeServiceProfile({
  providerId,
  showMetrics = true,
  showCapacity = true,
  showRecentActivity = true,
  compact = false,
  refreshInterval = 30000, // 30 seconds
  className = ''
}: RealTimeServiceProfileProps) {
  const [provider, setProvider] = useState<any>(null);
  const [metrics, setMetrics] = useState<ProviderMetrics | null>(null);
  const [capacity, setCapacity] = useState<ServiceCapacity | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<RealtimeUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>(new Date().toISOString());

  const { socket, isConnected } = useSocket();
  const { statusData, fetchProviderStatus } = useProviderStatus();

  // Fetch provider profile data
  const fetchProviderProfile = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/providers/real-time-profile?providerId=${providerId}`);
      if (!response.ok) throw new Error('Failed to fetch provider profile');
      
      const data = await response.json();
      setProvider(data.provider);
      setMetrics(data.metrics);
      setCapacity(data.capacity);
      setLastRefresh(new Date().toISOString());
      
      if (isLoading) setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch provider data';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [providerId, isLoading]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchProviderProfile();
    fetchProviderStatus(providerId);

    const interval = setInterval(fetchProviderProfile, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchProviderProfile, fetchProviderStatus, providerId, refreshInterval]);

  // Real-time updates via WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleProviderUpdate = (data: any) => {
      if (data.providerId === providerId) {
        // Update metrics
        if (data.metrics) {
          setMetrics(prev => prev ? { ...prev, ...data.metrics } : data.metrics);
        }

        // Update capacity
        if (data.capacity) {
          setCapacity(prev => prev ? { ...prev, ...data.capacity } : data.capacity);
        }

        // Add to recent updates
        setRecentUpdates(prev => [
          {
            timestamp: new Date().toISOString(),
            type: data.type || 'booking',
            data: data
          },
          ...prev.slice(0, 9) // Keep last 10 updates
        ]);
      }
    };

    socket.on('provider_metrics_update', handleProviderUpdate);
    socket.on('provider_capacity_update', handleProviderUpdate);
    socket.on('booking_status_change', handleProviderUpdate);
    socket.on('rating_updated', handleProviderUpdate);

    // Subscribe to provider updates
    socket.emit('subscribe_provider_updates', { providerId });

    return () => {
      socket.off('provider_metrics_update', handleProviderUpdate);
      socket.off('provider_capacity_update', handleProviderUpdate);
      socket.off('booking_status_change', handleProviderUpdate);
      socket.off('rating_updated', handleProviderUpdate);
      socket.emit('unsubscribe_provider_updates', { providerId });
    };
  }, [socket, isConnected, providerId]);

  const getPerformanceLevel = (score: number): { level: string; color: string } => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600 bg-green-100' };
    if (score >= 80) return { level: 'Very Good', color: 'text-blue-600 bg-blue-100' };
    if (score >= 70) return { level: 'Good', color: 'text-yellow-600 bg-yellow-100' };
    if (score >= 60) return { level: 'Fair', color: 'text-orange-600 bg-orange-100' };
    return { level: 'Poor', color: 'text-red-600 bg-red-100' };
  };

  const getCapacityStatus = (capacity: ServiceCapacity): { status: string; color: string } => {
    const utilization = (capacity.current / capacity.maximum) * 100;
    
    if (utilization >= 90) return { status: 'Very Busy', color: 'text-red-600 bg-red-100' };
    if (utilization >= 70) return { status: 'Busy', color: 'text-orange-600 bg-orange-100' };
    if (utilization >= 50) return { status: 'Moderate', color: 'text-yellow-600 bg-yellow-100' };
    return { status: 'Available', color: 'text-green-600 bg-green-100' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ne-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getUpdateIcon = (type: RealtimeUpdate['type']) => {
    switch (type) {
      case 'booking': return <Calendar className="h-3 w-3" />;
      case 'rating': return <Star className="h-3 w-3" />;
      case 'completion': return <CheckCircle className="h-3 w-3" />;
      case 'availability': return <Activity className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !provider) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600 mb-4">
            <AlertTriangle className="h-5 w-5" />
            <span>{error || 'Provider not found'}</span>
          </div>
          <Button onClick={fetchProviderProfile} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 bg-white rounded-lg shadow-sm border ${className}`}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {provider.name.charAt(0)}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              statusData?.isAvailable ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{provider.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{metrics?.averageRating?.toFixed(1)} ({metrics?.reviewCount})</span>
              {metrics?.completionRate && (
                <>
                  <span>•</span>
                  <span>{metrics.completionRate}% completion</span>
                </>
              )}
            </div>
          </div>
          {capacity && (
            <div className="text-right">
              <div className="text-sm font-medium">
                {capacity.current}/{capacity.maximum}
              </div>
              <div className="text-xs text-gray-500">capacity</div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {provider.name.charAt(0)}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                  statusData?.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
              <div>
                <CardTitle className="text-xl">{provider.name}</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{provider.zones?.join(', ') || 'Service areas not specified'}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={statusData?.isAvailable ? 'default' : 'secondary'}>
                    {statusData?.status || 'Unknown'}
                  </Badge>
                  {provider.verified && (
                    <Badge variant="outline" className="text-green-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm text-gray-500">
                Updated {formatDistanceToNow(new Date(lastRefresh))} ago
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProviderProfile}
                className="p-1"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Performance Overview */}
          {showMetrics && metrics && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Performance Metrics</span>
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg"
                >
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-bold">{metrics.averageRating.toFixed(1)}</span>
                  </div>
                  <div className="text-xs text-gray-600">Rating ({metrics.reviewCount} reviews)</div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg"
                >
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-bold">{metrics.completionRate}%</span>
                  </div>
                  <div className="text-xs text-gray-600">Completion Rate</div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg"
                >
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="text-lg font-bold">{metrics.responseTime}min</span>
                  </div>
                  <div className="text-xs text-gray-600">Avg Response</div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg"
                >
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Users className="h-4 w-4 text-orange-600" />
                    <span className="text-lg font-bold">{metrics.totalBookings}</span>
                  </div>
                  <div className="text-xs text-gray-600">Total Bookings</div>
                </motion.div>
              </div>

              {/* Additional metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">On-Time Performance</span>
                    <Badge className={getPerformanceLevel(metrics.onTimePercentage).color}>
                      {getPerformanceLevel(metrics.onTimePercentage).level}
                    </Badge>
                  </div>
                  <Progress value={metrics.onTimePercentage} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">{metrics.onTimePercentage}%</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Customer Retention</span>
                    <Badge className={getPerformanceLevel(metrics.repeatCustomerRate).color}>
                      {metrics.repeatCustomerRate}%
                    </Badge>
                  </div>
                  <Progress value={metrics.repeatCustomerRate} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">Repeat customers</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Availability Rate</span>
                    <Badge className={getPerformanceLevel(metrics.availabilityRate).color}>
                      {metrics.availabilityRate}%
                    </Badge>
                  </div>
                  <Progress value={metrics.availabilityRate} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">This month</div>
                </div>
              </div>
            </div>
          )}

          {/* Capacity Information */}
          {showCapacity && capacity && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Current Capacity</span>
              </h4>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-2xl font-bold">
                      {capacity.current}/{capacity.maximum}
                    </div>
                    <div className="text-sm text-gray-600">Active bookings</div>
                  </div>
                  <Badge className={getCapacityStatus(capacity).color}>
                    {getCapacityStatus(capacity).status}
                  </Badge>
                </div>
                
                <Progress 
                  value={(capacity.current / capacity.maximum) * 100} 
                  className="h-3 mb-3"
                />
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">{capacity.upcoming}</div>
                    <div className="text-gray-500">Upcoming</div>
                  </div>
                  <div>
                    <div className="font-medium">{capacity.queueLength}</div>
                    <div className="text-gray-500">In Queue</div>
                  </div>
                  <div>
                    <div className="font-medium">
                      {capacity.estimatedWaitTime > 0 ? `${capacity.estimatedWaitTime}min` : 'Now'}
                    </div>
                    <div className="text-gray-500">Wait Time</div>
                  </div>
                </div>

                {capacity.nextAvailable && (
                  <div className="mt-3 text-sm text-blue-600">
                    Next available: {new Date(capacity.nextAvailable).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {showRecentActivity && recentUpdates.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Recent Activity</span>
              </h4>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <AnimatePresence>
                  {recentUpdates.slice(0, 5).map((update, index) => (
                    <motion.div
                      key={`${update.timestamp}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="text-blue-600">
                        {getUpdateIcon(update.type)}
                      </div>
                      <div className="flex-1 text-sm">
                        <span className="capitalize">{update.type}</span> update
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(update.timestamp))} ago
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Earnings Overview */}
          {metrics?.thisMonthEarnings !== undefined && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold flex items-center space-x-2 mb-3">
                <DollarSign className="h-4 w-4" />
                <span>Earnings Overview</span>
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-lg font-bold text-green-700">
                    {formatCurrency(metrics.thisMonthEarnings)}
                  </div>
                  <div className="text-sm text-green-600">This Month</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-700">
                    {formatCurrency(metrics.lastMonthEarnings)}
                  </div>
                  <div className="text-sm text-gray-600">Last Month</div>
                </div>
              </div>
              
              {metrics.thisMonthEarnings > metrics.lastMonthEarnings && (
                <div className="flex items-center space-x-1 mt-2 text-sm text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>
                    +{((metrics.thisMonthEarnings - metrics.lastMonthEarnings) / metrics.lastMonthEarnings * 100).toFixed(1)}% 
                    from last month
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Contact Actions */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button className="flex-1" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Call Provider
            </Button>
            <Button variant="outline" className="flex-1" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>

          {/* Connection status */}
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 pt-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Live data active' : 'Reconnecting...'}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}