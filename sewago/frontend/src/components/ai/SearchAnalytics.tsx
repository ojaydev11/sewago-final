'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Search, 
  Users, 
  Clock,
  Target,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface SearchAnalyticsData {
  summary: {
    totalSearches: number;
    successRate: number;
    abandonmentRate: number;
    correctionRate: number;
  };
  topQueries: Array<{
    query: string;
    count: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    count: number;
  }>;
  dailyTrends: Array<{
    date: string;
    count: number;
  }>;
  categoryInsights: Array<{
    category: string;
    count: number;
  }>;
  timeframe: string;
}

interface SearchAnalyticsProps {
  userId?: string | null;
  adminView?: boolean;
  className?: string;
}

export function SearchAnalytics({
  userId,
  adminView = false,
  className = ""
}: SearchAnalyticsProps) {
  const [data, setData] = useState<SearchAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('searches');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, userId]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        timeframe,
        ...(userId && { userId })
      });

      const response = await fetch(`/api/ai/search-analytics?${params}`);
      
      if (response.ok) {
        const analytics = await response.json();
        setData(analytics);
      }
    } catch (error) {
      console.error('Failed to fetch search analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getTimeframeName = (tf: string) => {
    const names = {
      '1d': 'Last 24 hours',
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 90 days'
    };
    return names[tf as keyof typeof names] || tf;
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAbandonmentRateColor = (rate: number) => {
    if (rate <= 20) return 'text-green-600 bg-green-100';
    if (rate <= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-500">Search analytics will appear here once users start searching.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-7 w-7 text-blue-600 mr-2" />
            Search Analytics
          </h2>
          <p className="text-gray-500 mt-1">
            {adminView ? 'Platform-wide' : 'Your'} search behavior insights
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={fetchAnalytics}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Searches</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.summary.totalSearches.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="text-xs">
                  {getTimeframeName(timeframe)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.summary.successRate.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={data.summary.successRate} className="h-2" />
                <Badge 
                  variant="secondary" 
                  className={`text-xs mt-2 ${getSuccessRateColor(data.summary.successRate)}`}
                >
                  {data.summary.successRate >= 80 ? 'Excellent' : 
                   data.summary.successRate >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Abandonment Rate</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.summary.abandonmentRate.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={100 - data.summary.abandonmentRate} className="h-2" />
                <Badge 
                  variant="secondary" 
                  className={`text-xs mt-2 ${getAbandonmentRateColor(data.summary.abandonmentRate)}`}
                >
                  {data.summary.abandonmentRate <= 20 ? 'Low' : 
                   data.summary.abandonmentRate <= 40 ? 'Moderate' : 'High'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Auto-Corrections</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.summary.correctionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="text-xs">
                  Typo corrections applied
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Top Search Queries</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topQueries.slice(0, 10).map((query, index) => (
              <motion.div
                key={query.query}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <span className="font-medium text-gray-900">{query.query}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{query.count} searches</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (query.count / data.topQueries[0].count) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Device and Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="h-5 w-5 text-green-600" />
              <span>Device Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.deviceBreakdown.map((device, index) => {
                const percentage = data.summary.totalSearches > 0 
                  ? (device.count / data.summary.totalSearches) * 100 
                  : 0;
                
                return (
                  <motion.div
                    key={device.device}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      {getDeviceIcon(device.device)}
                      <span className="font-medium text-gray-900 capitalize">
                        {device.device}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">
                        {device.count} ({percentage.toFixed(1)}%)
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <span>Popular Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.categoryInsights.slice(0, 6).map((category, index) => {
                const maxCount = Math.max(...data.categoryInsights.map(c => c.count));
                const percentage = maxCount > 0 ? (category.count / maxCount) * 100 : 0;
                
                return (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="text-xs">
                        {category.category}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">
                        {category.count} searches
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trends */}
      {data.dailyTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Daily Search Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.dailyTrends.slice(-7).map((day, index) => {
                const maxCount = Math.max(...data.dailyTrends.map(d => d.count));
                const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                const prevDay = data.dailyTrends[index - 1];
                const trend = prevDay ? day.count - prevDay.count : 0;
                
                return (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700 w-20">
                        {new Date(day.date).toLocaleDateString('en', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{day.count}</span>
                      {trend !== 0 && (
                        <div className={`flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trend > 0 ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )}
                          <span className="text-xs">{Math.abs(trend)}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}