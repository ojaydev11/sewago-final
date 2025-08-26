'use client';
import 'client-only';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface GrowthMetrics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  totalProviders: number;
  newProviders: number;
  activeProviders: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  customerSatisfaction: number;
  marketPenetration: number;
  userRetentionRate: number;
  providerUtilization: number;
  platformGrowthRate: number;
  revenueGrowthRate: number;
  customerAcquisitionCost: number;
  lifetimeValue: number;
  churnRate: number;
}

export interface GrowthTrend {
  periodOverPeriod: {
    users: number;
    providers: number;
    bookings: number;
    revenue: number;
  };
  overallGrowth: {
    users: number;
    providers: number;
    bookings: number;
    revenue: number;
  };
  compoundGrowth: {
    users: number;
    providers: number;
    bookings: number;
    revenue: number;
  } | null;
}

export interface MarketSegmentation {
  serviceCategories: Array<{
    category: string;
    bookings: number;
    revenue: number;
    averageOrderValue: number;
  }>;
  acquisitionChannels: Array<{
    channel: string;
    users: number;
    percentage: number;
  }>;
}

export interface GrowthForecast {
  forecasts: Array<{
    date: Date;
    totalUsers: number;
    totalRevenue: number;
    totalBookings: number;
    confidence: number;
  }>;
  trends: {
    userGrowthTrend: 'Growing' | 'Declining';
    revenueGrowthTrend: 'Growing' | 'Declining';
    bookingGrowthTrend: 'Growing' | 'Declining';
  };
  reliability: 'High' | 'Medium' | 'Low';
}

export interface UseGrowthMetricsOptions {
  timeframe?: '1w' | '1m' | '3m' | '6m' | '1y' | 'all';
  granularity?: 'daily' | 'weekly' | 'monthly';
  includeForecasting?: boolean;
  includeSegmentation?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseGrowthMetricsReturn {
  currentMetrics: GrowthMetrics | null;
  historicalMetrics: GrowthMetrics[];
  growthAnalysis: GrowthTrend | null;
  segmentation: MarketSegmentation | null;
  forecasting: GrowthForecast | null;
  kpis: any;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateTimeframe: (timeframe: UseGrowthMetricsOptions['timeframe']) => void;
  updateGranularity: (granularity: UseGrowthMetricsOptions['granularity']) => void;
  exportData: () => void;
  calculateMetricChange: (metric: keyof GrowthMetrics) => { change: number; trend: 'up' | 'down' | 'stable' };
}

export const useGrowthMetrics = (
  options: UseGrowthMetricsOptions = {}
): UseGrowthMetricsReturn => {
  const {
    timeframe = '1m',
    granularity = 'daily',
    includeForecasting = false,
    includeSegmentation = false,
    autoRefresh = false,
    refreshInterval = 300000 // 5 minutes
  } = options;

  const [currentMetrics, setCurrentMetrics] = useState<GrowthMetrics | null>(null);
  const [historicalMetrics, setHistoricalMetrics] = useState<GrowthMetrics[]>([]);
  const [growthAnalysis, setGrowthAnalysis] = useState<GrowthTrend | null>(null);
  const [segmentation, setSegmentation] = useState<MarketSegmentation | null>(null);
  const [forecasting, setForecasting] = useState<GrowthForecast | null>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTimeframe, setCurrentTimeframe] = useState(timeframe);
  const [currentGranularity, setCurrentGranularity] = useState(granularity);

  const fetchGrowthMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        timeframe: currentTimeframe,
        granularity: currentGranularity,
        includeForecasting: includeForecasting.toString(),
        includeSegmentation: includeSegmentation.toString(),
      });

      const response = await fetch(`/api/marketplace/growth-metrics?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch growth metrics: ${response.statusText}`);
      }

      const data = await response.json();

      setCurrentMetrics(data.currentMetrics);
      setHistoricalMetrics(data.historicalMetrics || []);
      setGrowthAnalysis(data.growthAnalysis);
      setSegmentation(data.segmentation);
      setForecasting(data.forecasting);
      setKpis(data.kpis);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch growth metrics';
      setError(errorMessage);
      console.error('Growth metrics error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentTimeframe, currentGranularity, includeForecasting, includeSegmentation]);

  const refresh = useCallback(async () => {
    await fetchGrowthMetrics();
  }, [fetchGrowthMetrics]);

  const updateTimeframe = useCallback((newTimeframe: UseGrowthMetricsOptions['timeframe']) => {
    if (newTimeframe) {
      setCurrentTimeframe(newTimeframe);
    }
  }, []);

  const updateGranularity = useCallback((newGranularity: UseGrowthMetricsOptions['granularity']) => {
    if (newGranularity) {
      setCurrentGranularity(newGranularity);
    }
  }, []);

  const calculateMetricChange = useCallback((metric: keyof GrowthMetrics) => {
    if (historicalMetrics.length < 2 || !currentMetrics) {
      return { change: 0, trend: 'stable' as const };
    }

    const current = currentMetrics[metric] as number;
    const previous = historicalMetrics[historicalMetrics.length - 2][metric] as number;

    if (previous === 0) {
      return { 
        change: current > 0 ? 100 : 0, 
        trend: current > 0 ? 'up' as const : 'stable' as const 
      };
    }

    const change = ((current - previous) / previous) * 100;
    const trend = Math.abs(change) < 1 ? 'stable' : change > 0 ? 'up' : 'down';

    return { change, trend };
  }, [historicalMetrics, currentMetrics]);

  const exportData = useCallback(() => {
    const dataToExport = {
      currentMetrics,
      historicalMetrics,
      growthAnalysis,
      segmentation,
      forecasting,
      kpis,
      timeframe: currentTimeframe,
      granularity: currentGranularity,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `growth-metrics-${currentTimeframe}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [currentMetrics, historicalMetrics, growthAnalysis, segmentation, forecasting, kpis, currentTimeframe, currentGranularity]);

  // Initial load
  useEffect(() => {
    fetchGrowthMetrics();
  }, [fetchGrowthMetrics]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(fetchGrowthMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchGrowthMetrics]);

  return {
    currentMetrics,
    historicalMetrics,
    growthAnalysis,
    segmentation,
    forecasting,
    kpis,
    loading,
    error,
    refresh,
    updateTimeframe,
    updateGranularity,
    exportData,
    calculateMetricChange
  };
};

// Utility functions for growth metrics

export const formatGrowthData = (metrics: GrowthMetrics[]) => {
  return metrics.map(metric => ({
    ...metric,
    date: new Date(metric.createdAt || Date.now()).toLocaleDateString(),
    // Ensure all numeric values are properly formatted
    totalUsers: Number(metric.totalUsers),
    newUsers: Number(metric.newUsers),
    activeUsers: Number(metric.activeUsers),
    totalProviders: Number(metric.totalProviders),
    newProviders: Number(metric.newProviders),
    activeProviders: Number(metric.activeProviders),
    totalBookings: Number(metric.totalBookings),
    completedBookings: Number(metric.completedBookings),
    totalRevenue: Number(metric.totalRevenue),
    averageOrderValue: Number(metric.averageOrderValue),
    conversionRate: Number(metric.conversionRate),
    customerSatisfaction: Number(metric.customerSatisfaction),
    marketPenetration: Number(metric.marketPenetration),
    userRetentionRate: Number(metric.userRetentionRate),
    providerUtilization: Number(metric.providerUtilization),
    platformGrowthRate: Number(metric.platformGrowthRate),
    revenueGrowthRate: Number(metric.revenueGrowthRate),
    customerAcquisitionCost: Number(metric.customerAcquisitionCost),
    lifetimeValue: Number(metric.lifetimeValue),
    churnRate: Number(metric.churnRate),
  }));
};

export const calculateCompoundAnnualGrowthRate = (
  startValue: number,
  endValue: number,
  periods: number
): number => {
  if (startValue <= 0 || periods <= 0) return 0;
  return (Math.pow(endValue / startValue, 1 / periods) - 1) * 100;
};

export const getGrowthHealthScore = (metrics: GrowthMetrics | null): number => {
  if (!metrics) return 0;

  // Weighted score based on key metrics
  const weights = {
    userGrowth: 0.25,      // 25% - User acquisition
    revenueGrowth: 0.25,   // 25% - Revenue growth
    retention: 0.20,       // 20% - User retention
    satisfaction: 0.15,    // 15% - Customer satisfaction
    utilization: 0.15      // 15% - Provider utilization
  };

  const scores = {
    userGrowth: Math.min(100, Math.max(0, metrics.platformGrowthRate + 50)), // Normalize around 0%
    revenueGrowth: Math.min(100, Math.max(0, metrics.revenueGrowthRate + 50)), // Normalize around 0%
    retention: metrics.userRetentionRate,
    satisfaction: (metrics.customerSatisfaction / 5) * 100, // Convert 1-5 scale to percentage
    utilization: metrics.providerUtilization
  };

  const healthScore = Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (scores[key as keyof typeof scores] * weight);
  }, 0);

  return Math.round(Math.max(0, Math.min(100, healthScore)));
};

export const identifyGrowthOpportunities = (
  metrics: GrowthMetrics | null,
  trends: GrowthTrend | null
): Array<{ opportunity: string; priority: 'high' | 'medium' | 'low'; description: string }> => {
  const opportunities = [];

  if (!metrics || !trends) return opportunities;

  // User acquisition opportunities
  if (trends.periodOverPeriod.users < 10) {
    opportunities.push({
      opportunity: 'Accelerate User Acquisition',
      priority: 'high' as const,
      description: 'User growth is below 10%. Focus on marketing campaigns and referral programs.'
    });
  }

  // Provider supply opportunities
  if (metrics.providerUtilization > 85) {
    opportunities.push({
      opportunity: 'Expand Provider Network',
      priority: 'high' as const,
      description: 'Provider utilization is very high. Recruit more providers to meet demand.'
    });
  }

  // Revenue optimization opportunities
  if (metrics.averageOrderValue < 150000) { // NPR 1500 in paisa
    opportunities.push({
      opportunity: 'Increase Average Order Value',
      priority: 'medium' as const,
      description: 'AOV is below target. Consider upselling strategies and premium service tiers.'
    });
  }

  // Customer retention opportunities
  if (metrics.userRetentionRate < 60) {
    opportunities.push({
      opportunity: 'Improve Customer Retention',
      priority: 'high' as const,
      description: 'Retention rate needs improvement. Implement loyalty programs and follow-up strategies.'
    });
  }

  // Conversion rate opportunities
  if (metrics.conversionRate < 70) {
    opportunities.push({
      opportunity: 'Optimize Conversion Funnel',
      priority: 'medium' as const,
      description: 'Booking conversion rate can be improved. Analyze user journey and remove friction.'
    });
  }

  // Market penetration opportunities
  if (metrics.marketPenetration < 25) {
    opportunities.push({
      opportunity: 'Increase Market Penetration',
      priority: 'medium' as const,
      description: 'Market share is low. Expand to new areas and enhance brand awareness.'
    });
  }

  return opportunities.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

export const predictNextPeriodMetrics = (
  historicalMetrics: GrowthMetrics[],
  periodsAhead: number = 1
): Partial<GrowthMetrics> | null => {
  if (historicalMetrics.length < 3) return null;

  const recent = historicalMetrics.slice(-3); // Use last 3 periods for prediction
  const predictions: Partial<GrowthMetrics> = {};

  // Simple linear trend prediction for key metrics
  const metricsToPredict: Array<keyof GrowthMetrics> = [
    'totalUsers',
    'totalRevenue',
    'totalBookings',
    'averageOrderValue',
    'conversionRate'
  ];

  metricsToPredict.forEach(metric => {
    const values = recent.map(m => m[metric] as number);
    
    if (values.length >= 2) {
      // Calculate trend
      const trend = (values[values.length - 1] - values[0]) / (values.length - 1);
      const predicted = values[values.length - 1] + (trend * periodsAhead);
      
      predictions[metric] = Math.max(0, predicted) as any;
    }
  });

  return predictions;
};