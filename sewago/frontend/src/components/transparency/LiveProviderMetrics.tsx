'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSocket } from '@/hooks/useSocket';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Clock, 
  CheckCircle, 
  Star, 
  Users,
  Activity,
  AlertTriangle,
  Target,
  Award,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface MetricData {
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  target?: number;
  unit: string;
  timeWindow: '1h' | '24h' | '7d' | '30d';
}

interface ProviderMetrics {
  responseTime: MetricData;
  completionRate: MetricData;
  customerRating: MetricData;
  bookingVolume: MetricData;
  onTimeRate: MetricData;
  cancellationRate: MetricData;
  revenuePerHour: MetricData;
  customerRetention: MetricData;
}

interface LiveProviderMetricsProps {
  providerId: string;
  timeWindow?: '1h' | '24h' | '7d' | '30d';
  showTargets?: boolean;
  showTrends?: boolean;
  refreshInterval?: number;
  className?: string;
}

export default function LiveProviderMetrics({
  providerId,
  timeWindow = '24h',
  showTargets = true,
  showTrends = true,
  refreshInterval = 60000, // 1 minute
  className = ''
}: LiveProviderMetricsProps) {
  const [metrics, setMetrics] = useState<ProviderMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<keyof ProviderMetrics | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  const { socket, isConnected } = useSocket();

  // Fetch metrics data
  const fetchMetrics = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/providers/live-metrics?providerId=${providerId}&timeWindow=${timeWindow}`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      
      const data: ProviderMetrics = await response.json();
      setMetrics(data);
      setLastUpdate(new Date().toISOString());
      
      if (isLoading) setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metrics';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [providerId, timeWindow, refreshInterval]);

  // Real-time metric updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMetricUpdate = (data: any) => {
      if (data.providerId === providerId) {
        setMetrics(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            [data.metricName]: {
              ...prev[data.metricName as keyof ProviderMetrics],
              current: data.value,
              previous: prev[data.metricName as keyof ProviderMetrics].current,
              trend: data.trend,
              changePercentage: data.changePercentage
            }
          };
        });
        setLastUpdate(new Date().toISOString());
      }
    };

    socket.on('provider_metric_update', handleMetricUpdate);
    socket.emit('subscribe_provider_metrics', { providerId, timeWindow });

    return () => {
      socket.off('provider_metric_update', handleMetricUpdate);
      socket.emit('unsubscribe_provider_metrics', { providerId });
    };
  }, [socket, isConnected, providerId, timeWindow]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      case 'stable': return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', isPositive: boolean = true) => {
    if (trend === 'stable') return 'text-gray-600';
    
    // For metrics where higher is better (most cases)
    if (isPositive) {
      return trend === 'up' ? 'text-green-600' : 'text-red-600';
    }
    // For metrics where lower is better (response time, cancellation rate)
    return trend === 'up' ? 'text-red-600' : 'text-green-600';
  };

  const getMetricIcon = (metricName: keyof ProviderMetrics) => {
    const iconMap = {
      responseTime: <Clock className="h-4 w-4" />,
      completionRate: <CheckCircle className="h-4 w-4" />,
      customerRating: <Star className="h-4 w-4" />,
      bookingVolume: <Users className="h-4 w-4" />,
      onTimeRate: <Target className="h-4 w-4" />,
      cancellationRate: <AlertTriangle className="h-4 w-4" />,
      revenuePerHour: <Award className="h-4 w-4" />,
      customerRetention: <Activity className="h-4 w-4" />
    };
    return iconMap[metricName];
  };

  const getMetricLabel = (metricName: keyof ProviderMetrics) => {
    const labelMap = {
      responseTime: 'Response Time',
      completionRate: 'Completion Rate',
      customerRating: 'Customer Rating',
      bookingVolume: 'Booking Volume',
      onTimeRate: 'On-Time Rate',
      cancellationRate: 'Cancellation Rate',
      revenuePerHour: 'Revenue/Hour',
      customerRetention: 'Customer Retention'
    };
    return labelMap[metricName];
  };

  const formatMetricValue = (metric: MetricData) => {
    if (metric.unit === '%') {
      return `${metric.current.toFixed(1)}%`;
    }
    if (metric.unit === 'min') {
      return `${metric.current.toFixed(0)}min`;
    }
    if (metric.unit === 'NPR') {
      return `NPR ${metric.current.toLocaleString()}`;
    }
    if (metric.unit === 'rating') {
      return `${metric.current.toFixed(1)}/5`;
    }
    return `${metric.current.toFixed(0)}${metric.unit}`;
  };

  const getPerformanceLevel = (metric: MetricData, isInverted: boolean = false): { level: string; color: string } => {
    let score: number;
    
    if (metric.target) {
      score = isInverted 
        ? ((metric.target - metric.current) / metric.target) * 100
        : (metric.current / metric.target) * 100;
    } else {
      // Default scoring for metrics without targets
      score = isInverted ? 100 - metric.current : metric.current;
    }
    
    if (score >= 90) return { level: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 80) return { level: 'Very Good', color: 'bg-blue-100 text-blue-800' };
    if (score >= 70) return { level: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 60) return { level: 'Fair', color: 'bg-orange-100 text-orange-800' };
    return { level: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600 mb-4">
            <AlertTriangle className="h-5 w-5" />
            <span>{error || 'Failed to load metrics'}</span>
          </div>
          <Button onClick={fetchMetrics} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </CardContent>
      </Card>
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
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Live Performance Metrics</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {timeWindow} window
              </Badge>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>Live</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(metrics).map(([key, metric]) => {
              const metricKey = key as keyof ProviderMetrics;
              const isInverted = ['responseTime', 'cancellationRate'].includes(metricKey);
              const performance = getPerformanceLevel(metric, isInverted);
              
              return (
                <motion.div
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMetric(selectedMetric === metricKey ? null : metricKey)}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                    selectedMetric === metricKey
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getMetricIcon(metricKey)}
                      <span className="text-sm font-medium">{getMetricLabel(metricKey)}</span>
                    </div>
                    {showTrends && getTrendIcon(metric.trend)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{formatMetricValue(metric)}</div>
                    
                    {showTrends && (
                      <div className={`flex items-center space-x-1 text-xs ${getTrendColor(metric.trend, !isInverted)}`}>
                        <span>
                          {metric.changePercentage > 0 ? '+' : ''}
                          {metric.changePercentage.toFixed(1)}%
                        </span>
                        <span className="text-gray-500">vs previous</span>
                      </div>
                    )}
                    
                    {showTargets && metric.target && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>Target: {formatMetricValue({ ...metric, current: metric.target })}</span>
                          <Badge className={performance.color} variant="secondary">
                            {performance.level}
                          </Badge>
                        </div>
                        <Progress 
                          value={isInverted 
                            ? Math.max(0, 100 - (metric.current / metric.target) * 100)
                            : Math.min(100, (metric.current / metric.target) * 100)
                          }
                          className="h-1"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Detailed view for selected metric */}
          <AnimatePresence>
            {selectedMetric && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-50 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center space-x-2">
                    {getMetricIcon(selectedMetric)}
                    <span>{getMetricLabel(selectedMetric)} Details</span>
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMetric(null)}
                    className="p-1"
                  >
                    ×
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Current Value</div>
                    <div className="font-semibold">{formatMetricValue(metrics[selectedMetric])}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Previous Period</div>
                    <div className="font-semibold">
                      {formatMetricValue({ ...metrics[selectedMetric], current: metrics[selectedMetric].previous })}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Change</div>
                    <div className={`font-semibold ${getTrendColor(metrics[selectedMetric].trend, !['responseTime', 'cancellationRate'].includes(selectedMetric))}`}>
                      {metrics[selectedMetric].changePercentage > 0 ? '+' : ''}
                      {metrics[selectedMetric].changePercentage.toFixed(1)}%
                    </div>
                  </div>
                  {metrics[selectedMetric].target && (
                    <div>
                      <div className="text-gray-600">Target</div>
                      <div className="font-semibold">
                        {formatMetricValue({ ...metrics[selectedMetric], current: metrics[selectedMetric].target! })}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Performance insights */}
                <div className="bg-white rounded-md p-3">
                  <h5 className="text-sm font-medium mb-2">Performance Insight</h5>
                  <p className="text-sm text-gray-600">
                    {getPerformanceInsight(selectedMetric, metrics[selectedMetric])}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary insights */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Overall Performance Summary</h4>
            <div className="text-sm text-gray-700">
              {getOverallPerformanceSummary(metrics)}
            </div>
          </div>

          {/* Last update info */}
          <div className="flex items-center justify-center text-xs text-gray-500">
            <RefreshCw className={`h-3 w-3 mr-1 ${isConnected ? '' : 'animate-spin'}`} />
            <span>
              Last updated: {new Date(lastUpdate).toLocaleTimeString()}
              {!isConnected && ' (Reconnecting...)'}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Helper function to generate performance insights
function getPerformanceInsight(metricName: keyof ProviderMetrics, metric: MetricData): string {
  const insights = {
    responseTime: metric.trend === 'down' 
      ? 'Great improvement in response time! Customers are getting quicker replies.'
      : metric.current > 15 
      ? 'Response time could be improved. Consider setting up auto-responses or notifications.'
      : 'Excellent response time! Keep up the good work.',
    
    completionRate: metric.current >= 95
      ? 'Outstanding completion rate! This builds strong customer trust.'
      : metric.current < 85
      ? 'Completion rate needs attention. Review booking processes and capacity management.'
      : 'Good completion rate. Small improvements could enhance customer satisfaction.',
    
    customerRating: metric.current >= 4.5
      ? 'Excellent customer satisfaction! Your service quality is outstanding.'
      : metric.current < 4.0
      ? 'Customer satisfaction needs improvement. Focus on service quality and communication.'
      : 'Good customer ratings. Consistent quality will help reach excellence.',
    
    bookingVolume: metric.trend === 'up'
      ? 'Great booking growth! Consider optimizing capacity to handle increased demand.'
      : 'Booking volume is stable. Marketing efforts might help increase visibility.',
    
    onTimeRate: metric.current >= 90
      ? 'Excellent punctuality! This is a key factor in customer satisfaction.'
      : 'On-time performance could be improved. Better scheduling and route planning may help.',
    
    cancellationRate: metric.current <= 5
      ? 'Low cancellation rate shows reliable service and good customer commitment.'
      : 'High cancellation rate may indicate capacity or scheduling issues.',
    
    revenuePerHour: metric.trend === 'up'
      ? 'Revenue efficiency is improving! Great job optimizing your time.'
      : 'Consider ways to increase service efficiency and pricing optimization.',
    
    customerRetention: metric.current >= 70
      ? 'Strong customer retention! Your service builds loyalty.'
      : 'Focus on customer satisfaction to improve retention rates.'
  };
  
  return insights[metricName];
}

// Helper function to generate overall performance summary
function getOverallPerformanceSummary(metrics: ProviderMetrics): string {
  const positiveMetrics = Object.values(metrics).filter(m => m.trend === 'up').length;
  const totalMetrics = Object.keys(metrics).length;
  const improvingPercentage = (positiveMetrics / totalMetrics) * 100;
  
  if (improvingPercentage >= 70) {
    return 'Excellent performance trend! Most metrics are improving, showing strong service delivery.';
  } else if (improvingPercentage >= 50) {
    return 'Good overall performance with room for improvement in some areas.';
  } else if (improvingPercentage >= 30) {
    return 'Mixed performance. Focus on areas needing improvement while maintaining strengths.';
  } else {
    return 'Performance needs attention. Consider reviewing service processes and customer feedback.';
  }
}