'use client';
import 'client-only';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface ProviderAnalytics {
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
  responseTime: number;
  completionRate: number;
  customerRetention: number;
  growthRate: number;
  marketShare: number;
  customerLoyalty: number;
  seasonalTrends: any[];
  performanceTrends: any[];
  competitorComparison: any;
  lastUpdated: string;
}

export interface PerformanceMetric {
  date: string;
  revenue: number;
  bookings: number;
  completedBookings: number;
  averageRating: number;
  responseTime: number;
}

export interface UseProviderAnalyticsOptions {
  timeframe?: '1w' | '1m' | '3m' | '6m' | '1y';
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export interface UseProviderAnalyticsReturn {
  analytics: ProviderAnalytics | null;
  performance: PerformanceMetric[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateTimeframe: (timeframe: UseProviderAnalyticsOptions['timeframe']) => void;
  calculateGrowthRate: (current: number, previous: number) => number;
  getPerformanceTrend: (metric: keyof PerformanceMetric) => 'up' | 'down' | 'stable';
  exportData: () => void;
}

export const useProviderAnalytics = (
  providerId: string,
  options: UseProviderAnalyticsOptions = {}
): UseProviderAnalyticsReturn => {
  const {
    timeframe = '1m',
    autoRefresh = false,
    refreshInterval = 300000 // 5 minutes default
  } = options;

  const [analytics, setAnalytics] = useState<ProviderAnalytics | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTimeframe, setCurrentTimeframe] = useState(timeframe);

  const fetchAnalytics = useCallback(async () => {
    if (!providerId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/providers/analytics?providerId=${providerId}&timeframe=${currentTimeframe}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.analytics) {
        setAnalytics(data.analytics);
      }

      if (data.performance) {
        setPerformance(data.performance);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      console.error('Provider analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, [providerId, currentTimeframe]);

  const refresh = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  const updateTimeframe = useCallback((newTimeframe: UseProviderAnalyticsOptions['timeframe']) => {
    if (newTimeframe) {
      setCurrentTimeframe(newTimeframe);
    }
  }, []);

  const calculateGrowthRate = useCallback((current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }, []);

  const getPerformanceTrend = useCallback((metric: keyof PerformanceMetric): 'up' | 'down' | 'stable' => {
    if (performance.length < 2) return 'stable';

    const recentData = performance.slice(-5); // Last 5 data points
    const earlierData = performance.slice(0, 5); // First 5 data points

    if (recentData.length === 0 || earlierData.length === 0) return 'stable';

    const recentAvg = recentData.reduce((sum, item) => sum + Number(item[metric]), 0) / recentData.length;
    const earlierAvg = earlierData.reduce((sum, item) => sum + Number(item[metric]), 0) / earlierData.length;

    const threshold = metric === 'responseTime' ? -5 : 5; // Response time should decrease
    const difference = recentAvg - earlierAvg;

    if (metric === 'responseTime') {
      // For response time, lower is better
      if (difference < threshold) return 'up'; // Improved (trend up in performance)
      if (difference > -threshold) return 'down'; // Worsened (trend down in performance)
      return 'stable';
    } else {
      // For other metrics, higher is better
      if (difference > threshold) return 'up';
      if (difference < -threshold) return 'down';
      return 'stable';
    }
  }, [performance]);

  const exportData = useCallback(() => {
    const dataToExport = {
      analytics,
      performance,
      timeframe: currentTimeframe,
      exportDate: new Date().toISOString(),
      providerId
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `provider-analytics-${providerId}-${currentTimeframe}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [analytics, performance, currentTimeframe, providerId]);

  // Initial load
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(fetchAnalytics, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAnalytics]);

  return {
    analytics,
    performance,
    loading,
    error,
    refresh,
    updateTimeframe,
    calculateGrowthRate,
    getPerformanceTrend,
    exportData
  };
};

// Utility function to format analytics data for charts
export const formatAnalyticsForChart = (performance: PerformanceMetric[]) => {
  return performance.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString(),
    revenue: Number(item.revenue),
    bookings: Number(item.bookings),
    completedBookings: Number(item.completedBookings),
    averageRating: Number(item.averageRating),
    responseTime: Number(item.responseTime)
  }));
};

// Utility function to calculate percentage change
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Utility function to get trend indicator
export const getTrendIndicator = (
  current: number, 
  previous: number, 
  isInverted: boolean = false
): { trend: 'up' | 'down' | 'stable'; percentage: number } => {
  const percentage = calculatePercentageChange(current, previous);
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  
  if (Math.abs(percentage) >= 5) { // 5% threshold for significant change
    if (isInverted) {
      trend = percentage > 0 ? 'down' : 'up'; // For metrics where lower is better
    } else {
      trend = percentage > 0 ? 'up' : 'down'; // For metrics where higher is better
    }
  }
  
  return { trend, percentage: Math.abs(percentage) };
};

// Utility function to aggregate performance data by period
export const aggregatePerformanceData = (
  performance: PerformanceMetric[],
  period: 'daily' | 'weekly' | 'monthly'
): PerformanceMetric[] => {
  if (period === 'daily') return performance;

  const aggregated = new Map<string, PerformanceMetric>();

  performance.forEach(item => {
    const date = new Date(item.date);
    let key: string;

    if (period === 'weekly') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      key = weekStart.toISOString().split('T')[0];
    } else { // monthly
      key = date.toISOString().slice(0, 7); // YYYY-MM
    }

    if (!aggregated.has(key)) {
      aggregated.set(key, {
        date: key,
        revenue: 0,
        bookings: 0,
        completedBookings: 0,
        averageRating: 0,
        responseTime: 0
      });
    }

    const existing = aggregated.get(key)!;
    existing.revenue += item.revenue;
    existing.bookings += item.bookings;
    existing.completedBookings += item.completedBookings;
    existing.averageRating = (existing.averageRating + item.averageRating) / 2; // Simple average
    existing.responseTime = (existing.responseTime + item.responseTime) / 2; // Simple average
  });

  return Array.from(aggregated.values()).sort((a, b) => a.date.localeCompare(b.date));
};

// Utility function to calculate key performance indicators
export const calculateKPIs = (analytics: ProviderAnalytics | null) => {
  if (!analytics) return null;

  const revenuePerBooking = analytics.totalBookings > 0 
    ? analytics.totalRevenue / analytics.totalBookings 
    : 0;

  const efficiency = analytics.responseTime > 0 
    ? 100 - (analytics.responseTime / 60 * 10) // Normalize to 0-100 scale
    : 0;

  const qualityScore = (analytics.averageRating / 5) * 100; // Convert to percentage

  const overallScore = (
    (analytics.completionRate * 0.3) + // 30% weight
    (qualityScore * 0.3) + // 30% weight
    (Math.min(efficiency, 100) * 0.2) + // 20% weight
    (Math.min(analytics.customerRetention, 100) * 0.2) // 20% weight
  );

  return {
    revenuePerBooking,
    efficiency: Math.max(0, Math.min(100, efficiency)),
    qualityScore,
    overallScore: Math.max(0, Math.min(100, overallScore)),
    growthMomentum: analytics.growthRate > 10 ? 'strong' : analytics.growthRate > 0 ? 'moderate' : 'weak'
  };
};