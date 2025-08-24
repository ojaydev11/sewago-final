'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Filter,
  Download,
  Users,
  Star,
  Clock,
  DollarSign,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';
import { useLocalizedCurrency } from '@/hooks/useLocalizedCurrency';

interface AnalyticsDashboardProps {
  providerId: string;
}

interface PerformanceMetric {
  date: string;
  revenue: number;
  bookings: number;
  averageRating: number;
  responseTime: number;
}

interface CategoryBreakdown {
  category: string;
  bookings: number;
  revenue: number;
  averageRating: number;
  completionRate: number;
}

interface CustomerSegment {
  segment: string;
  customers: number;
  revenue: number;
  retention: number;
  satisfaction: number;
}

const ProviderAnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ providerId }) => {
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([]);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
  const [timeframe, setTimeframe] = useState<'1w' | '1m' | '3m' | '6m' | '1y'>('1m');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { formatCurrency } = useLocalizedCurrency();

  useEffect(() => {
    loadAnalyticsData();
  }, [providerId, timeframe]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/providers/analytics?providerId=${providerId}&timeframe=${timeframe}`
      );

      if (!response.ok) {
        throw new Error('Failed to load analytics data');
      }

      const data = await response.json();

      // Process the performance data
      if (data.performance) {
        setPerformanceData(data.performance);
      }

      // Mock category and customer data (would come from API in real implementation)
      setCategoryData([
        { category: 'Cleaning', bookings: 45, revenue: 67500, averageRating: 4.6, completionRate: 95 },
        { category: 'Plumbing', bookings: 23, revenue: 34500, averageRating: 4.4, completionRate: 92 },
        { category: 'Electrical', bookings: 18, revenue: 27000, averageRating: 4.5, completionRate: 89 },
        { category: 'Gardening', bookings: 12, revenue: 18000, averageRating: 4.7, completionRate: 97 },
      ]);

      setCustomerSegments([
        { segment: 'Regular Customers', customers: 34, revenue: 85000, retention: 85, satisfaction: 4.6 },
        { segment: 'New Customers', customers: 67, revenue: 45000, retention: 25, satisfaction: 4.3 },
        { segment: 'VIP Customers', customers: 8, revenue: 32000, retention: 95, satisfaction: 4.8 },
        { segment: 'Seasonal', customers: 23, revenue: 28000, retention: 45, satisfaction: 4.4 },
      ]);

    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (data: PerformanceMetric[], field: keyof PerformanceMetric) => {
    if (data.length < 2) return 0;
    
    const recent = data.slice(-7); // Last 7 data points
    const earlier = data.slice(0, 7); // First 7 data points
    
    if (recent.length === 0 || earlier.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, item) => sum + Number(item[field]), 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, item) => sum + Number(item[field]), 0) / earlier.length;
    
    if (earlierAvg === 0) return 0;
    return ((recentAvg - earlierAvg) / earlierAvg) * 100;
  };

  const exportData = () => {
    const dataToExport = {
      performance: performanceData,
      categories: categoryData,
      customers: customerSegments,
      exportDate: new Date().toISOString(),
      timeframe
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `provider-analytics-${providerId}-${timeframe}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="link" 
            className="p-0 h-auto ml-2"
            onClick={loadAnalyticsData}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const revenueTrend = calculateTrend(performanceData, 'revenue');
  const bookingsTrend = calculateTrend(performanceData, 'bookings');
  const ratingTrend = calculateTrend(performanceData, 'averageRating');
  const responseTimeTrend = calculateTrend(performanceData, 'responseTime');

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Performance Analytics</h2>
          <p className="text-gray-600">Detailed insights into your service performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-lg p-1">
            {(['1w', '1m', '3m', '6m', '1y'] as const).map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeframe(period)}
              >
                {period}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Trend</p>
                <div className="flex items-center gap-2">
                  {revenueTrend >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${revenueTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(revenueTrend).toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bookings Trend</p>
                <div className="flex items-center gap-2">
                  {bookingsTrend >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${bookingsTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(bookingsTrend).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Target className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating Trend</p>
                <div className="flex items-center gap-2">
                  {ratingTrend >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${ratingTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(ratingTrend).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Star className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <div className="flex items-center gap-2">
                  {responseTimeTrend <= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${responseTimeTrend <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(responseTimeTrend).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance Over Time</TabsTrigger>
          <TabsTrigger value="categories">Service Categories</TabsTrigger>
          <TabsTrigger value="customers">Customer Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue & Bookings Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Bookings Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis yAxisId="revenue" orientation="left" />
                      <YAxis yAxisId="bookings" orientation="right" />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value, name) => {
                          if (name === 'Revenue') {
                            return [formatCurrency(Number(value)), name];
                          }
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="revenue"
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8884d8" 
                        name="Revenue"
                        strokeWidth={2}
                      />
                      <Line 
                        yAxisId="bookings"
                        type="monotone" 
                        dataKey="bookings" 
                        stroke="#82ca9d" 
                        name="Bookings"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Rating & Response Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis yAxisId="rating" domain={[3, 5]} orientation="left" />
                      <YAxis yAxisId="time" orientation="right" />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value, name) => {
                          if (name === 'Response Time') {
                            return [`${value} min`, name];
                          }
                          return [Number(value).toFixed(1), name];
                        }}
                      />
                      <Legend />
                      <Area 
                        yAxisId="rating"
                        type="monotone" 
                        dataKey="averageRating" 
                        stackId="1"
                        stroke="#ffc658" 
                        fill="#ffc658"
                        fillOpacity={0.6}
                        name="Average Rating"
                      />
                      <Line 
                        yAxisId="time"
                        type="monotone" 
                        dataKey="responseTime" 
                        stroke="#ff7300" 
                        name="Response Time"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Revenue Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, revenue }) => `${category}: ${formatCurrency(revenue)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category) => (
                    <div key={category.category} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{category.category}</h4>
                        <Badge variant="secondary">{category.bookings} bookings</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Revenue</p>
                          <p className="font-medium">{formatCurrency(category.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Avg Rating</p>
                          <p className="font-medium flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            {category.averageRating.toFixed(1)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span>Completion Rate</span>
                          <span>{category.completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${category.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Segment</th>
                      <th className="text-right p-2">Customers</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Retention</th>
                      <th className="text-right p-2">Satisfaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerSegments.map((segment) => (
                      <tr key={segment.segment} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{segment.segment}</td>
                        <td className="text-right p-2">{segment.customers}</td>
                        <td className="text-right p-2">{formatCurrency(segment.revenue)}</td>
                        <td className="text-right p-2">
                          <Badge 
                            variant={segment.retention >= 80 ? 'default' : segment.retention >= 60 ? 'secondary' : 'destructive'}
                          >
                            {segment.retention}%
                          </Badge>
                        </td>
                        <td className="text-right p-2">
                          <div className="flex items-center justify-end">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            {segment.satisfaction.toFixed(1)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderAnalyticsDashboard;