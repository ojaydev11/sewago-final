'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Star, 
  Clock, 
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Settings,
  RefreshCw,
  Calendar,
  Award,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { useLocalizedCurrency } from '@/hooks/useLocalizedCurrency';
import ProviderAnalyticsDashboard from './ProviderAnalyticsDashboard';
import ProviderBusinessInsights from './ProviderBusinessInsights';
import ProviderMarketingTools from './ProviderMarketingTools';
import ProviderFinancialDashboard from './ProviderFinancialDashboard';

interface ProviderToolsProps {
  providerId: string;
  providerName?: string;
  currentTier?: string;
}

interface ProviderOverview {
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
  responseTime: number;
  completionRate: number;
  customerRetention: number;
  growthRate: number;
  marketShare: number;
  tier: string;
  nextMilestone?: {
    title: string;
    progress: number;
    target: number;
  };
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  actionType: 'navigate' | 'modal' | 'external';
  href?: string;
}

const AdvancedProviderTools: React.FC<ProviderToolsProps> = ({ 
  providerId, 
  providerName, 
  currentTier = 'STANDARD' 
}) => {
  const [overview, setOverview] = useState<ProviderOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { formatCurrency } = useLocalizedCurrency();

  const quickActions: QuickAction[] = [
    {
      id: 'update-profile',
      title: 'Update Service Profile',
      description: 'Keep your services and availability current',
      icon: <Settings className="h-4 w-4" />,
      priority: 'medium',
      actionType: 'navigate',
      href: '/provider/profile'
    },
    {
      id: 'view-reviews',
      title: 'Customer Feedback',
      description: 'Review and respond to customer feedback',
      icon: <Star className="h-4 w-4" />,
      priority: 'high',
      actionType: 'navigate',
      href: '/provider/reviews'
    },
    {
      id: 'schedule-calendar',
      title: 'Manage Schedule',
      description: 'Update your availability calendar',
      icon: <Calendar className="h-4 w-4" />,
      priority: 'medium',
      actionType: 'navigate',
      href: '/provider/schedule'
    },
    {
      id: 'training-modules',
      title: 'Skill Development',
      description: 'Access training and certification programs',
      icon: <Award className="h-4 w-4" />,
      priority: 'low',
      actionType: 'navigate',
      href: '/provider/training'
    },
  ];

  useEffect(() => {
    loadProviderOverview();
  }, [providerId]);

  const loadProviderOverview = async () => {
    try {
      setLoading(true);
      
      // Load basic analytics overview
      const analyticsResponse = await fetch(
        `/api/providers/analytics?providerId=${providerId}&timeframe=1m`
      );
      const analyticsData = await analyticsResponse.json();

      if (analyticsData.analytics) {
        setOverview({
          ...analyticsData.analytics,
          tier: currentTier,
          nextMilestone: calculateNextMilestone(analyticsData.analytics)
        });
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load provider overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextMilestone = (analytics: any) => {
    // Define tier progression milestones
    const milestones = {
      'PROVISIONAL': { title: 'Become Standard Provider', target: 10, metric: 'completedBookings' },
      'STANDARD': { title: 'Reach Premium Status', target: 50, metric: 'completedBookings' },
      'PREMIUM': { title: 'Elite Provider Status', target: 100, metric: 'completedBookings' },
      'ELITE': { title: 'Master Provider Status', target: 200, metric: 'completedBookings' },
    };

    const currentMilestone = milestones[currentTier as keyof typeof milestones];
    if (currentMilestone) {
      const progress = analytics[currentMilestone.metric] || 0;
      return {
        ...currentMilestone,
        progress,
      };
    }

    return undefined;
  };

  const refreshData = async () => {
    await loadProviderOverview();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPerformanceIndicator = (value: number, type: 'percentage' | 'rating' | 'growth') => {
    switch (type) {
      case 'percentage':
        return value >= 90 ? 'text-green-600' : value >= 70 ? 'text-yellow-600' : 'text-red-600';
      case 'rating':
        return value >= 4.5 ? 'text-green-600' : value >= 4.0 ? 'text-yellow-600' : 'text-red-600';
      case 'growth':
        return value > 0 ? 'text-green-600' : value === 0 ? 'text-gray-600' : 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Provider Dashboard
            {providerName && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                - {providerName}
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive tools and insights for your service business
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={currentTier === 'ELITE' ? 'default' : 'secondary'}>
            {currentTier} Provider
          </Badge>
          <Button 
            onClick={refreshData} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(overview.totalRevenue)}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-green-100 ${getPerformanceIndicator(overview.growthRate, 'growth')}`}>
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
              {overview.growthRate !== 0 && (
                <div className="flex items-center mt-2">
                  <TrendingUp className={`h-4 w-4 mr-1 ${getPerformanceIndicator(overview.growthRate, 'growth')}`} />
                  <span className={`text-sm ${getPerformanceIndicator(overview.growthRate, 'growth')}`}>
                    {overview.growthRate > 0 ? '+' : ''}{overview.growthRate.toFixed(1)}% this month
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Jobs</p>
                  <p className="text-2xl font-bold">{overview.completedBookings}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${getPerformanceIndicator(overview.completionRate, 'percentage')}`}>
                  {overview.completionRate.toFixed(1)}% completion rate
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold">{overview.averageRating.toFixed(1)}</p>
                </div>
                <div className={`p-3 rounded-full bg-yellow-100`}>
                  <Star className={`h-6 w-6 ${getPerformanceIndicator(overview.averageRating, 'rating')}`} />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <Users className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {overview.customerRetention.toFixed(1)}% retention rate
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Time</p>
                  <p className="text-2xl font-bold">{overview.responseTime}m</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${overview.responseTime <= 15 ? 'text-green-600' : overview.responseTime <= 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {overview.responseTime <= 15 ? 'Excellent' : overview.responseTime <= 30 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Next Milestone Progress */}
      {overview?.nextMilestone && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{overview.nextMilestone.title}</h3>
                <p className="text-gray-600">
                  Progress: {overview.nextMilestone.progress} / {overview.nextMilestone.target}
                </p>
              </div>
              <Badge variant="outline">
                {Math.round((overview.nextMilestone.progress / overview.nextMilestone.target) * 100)}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${Math.min((overview.nextMilestone.progress / overview.nextMilestone.target) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Card key={action.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-lg bg-gray-100">
                      {action.icon}
                    </div>
                    <Badge variant={getPriorityColor(action.priority)} className="text-xs">
                      {action.priority}
                    </Badge>
                  </div>
                  <h4 className="font-semibold mb-1">{action.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                  <div className="flex items-center text-blue-600 text-sm">
                    <span>Take Action</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="marketing" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Marketing
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Financial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <ProviderAnalyticsDashboard providerId={providerId} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <ProviderBusinessInsights providerId={providerId} />
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <ProviderMarketingTools providerId={providerId} />
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <ProviderFinancialDashboard providerId={providerId} />
        </TabsContent>
      </Tabs>

      {/* Last Updated Info */}
      {lastUpdated && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Data last updated: {lastUpdated.toLocaleString()}. 
            <Button 
              variant="link" 
              className="p-0 h-auto ml-1"
              onClick={refreshData}
            >
              Refresh now
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AdvancedProviderTools;