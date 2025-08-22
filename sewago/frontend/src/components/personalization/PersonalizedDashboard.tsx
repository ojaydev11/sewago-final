'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  MapPin, 
  Clock, 
  Star, 
  Gift, 
  BarChart3,
  Calendar,
  Zap,
  Heart,
  Target,
  Sparkles
} from 'lucide-react';
import { SmartServiceGrid } from './SmartServiceGrid';
import { RecommendationCarousel } from './RecommendationCarousel';
import { LocationBasedSuggestions } from './LocationBasedSuggestions';
import { PersonalizedOffers } from './PersonalizedOffers';
import { UsageInsights } from './UsageInsights';
import { SmartScheduling } from './SmartScheduling';

interface PersonalizedDashboardProps {
  userId: string;
  className?: string;
}

interface DashboardData {
  user: {
    preferences: any;
    insights: any;
  };
  recommendations: {
    services: any[];
    location: any[];
    seasonal: any[];
    offers: any[];
  };
  analytics: {
    usage: any;
    scheduling: any[];
  };
  recentActivity: any[];
  personalizedGreeting: string;
  quickActions: any[];
  timestamp: string;
}

export function PersonalizedDashboard({ userId, className = '' }: PersonalizedDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'insights' | 'settings'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/personalization/dashboard?userId=${userId}`, {
        headers: {
          'x-session-id': generateSessionId()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const result = await response.json();
      if (result.success) {
        setDashboardData(result.data);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      console.error('Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const handleQuickAction = async (action: any) => {
    // Track quick action
    await fetch('/api/personalization/behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        event: {
          action: 'click',
          clickTarget: `quick_action_${action.id}`,
          metadata: { action }
        }
      })
    });

    // Handle action routing
    switch (action.action) {
      case 'search':
        window.location.href = '/search';
        break;
      case 'view_bookings':
        window.location.href = '/bookings';
        break;
      case 'book_service':
        window.location.href = `/search?category=${action.category}`;
        break;
      case 'track_order':
        window.location.href = '/tracking';
        break;
      case 'view_points':
        window.location.href = '/loyalty';
        break;
    }
  };

  if (loading) {
    return <PersonalizedDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <Card className="border-red-200">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={loadDashboardData}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Personalized Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-6 text-white"
      >
        <div className="relative z-10">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold mb-2"
          >
            {dashboardData.personalizedGreeting}
          </motion.h1>
          
          {dashboardData.user.insights?.personalityProfile && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-2 mb-4"
            >
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Sparkles className="w-3 h-3 mr-1" />
                {dashboardData.user.insights.personalityProfile.bookingFrequency} user
              </Badge>
              
              {dashboardData.user.insights.topCategories[0] && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Heart className="w-3 h-3 mr-1" />
                  {dashboardData.user.insights.topCategories[0]} lover
                </Badge>
              )}
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-2"
          >
            {dashboardData.quickActions.slice(0, 4).map((action, index) => (
              <Button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                variant="secondary"
                size="sm"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-200"
              >
                {getActionIcon(action.icon)}
                {action.title}
              </Button>
            ))}
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'recommendations', label: 'For You', icon: Target },
          { id: 'insights', label: 'Insights', icon: TrendingUp },
          { id: 'settings', label: 'Settings', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab dashboardData={dashboardData} userId={userId} />
          )}
          
          {activeTab === 'recommendations' && (
            <RecommendationsTab dashboardData={dashboardData} userId={userId} />
          )}
          
          {activeTab === 'insights' && (
            <InsightsTab dashboardData={dashboardData} userId={userId} />
          )}
          
          {activeTab === 'settings' && (
            <SettingsTab dashboardData={dashboardData} userId={userId} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Tab Components

function OverviewTab({ dashboardData, userId }: { dashboardData: DashboardData; userId: string }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Smart Service Grid */}
        <SmartServiceGrid 
          userId={userId}
          recommendations={dashboardData.recommendations.services}
          title="Recommended for You"
        />

        {/* Seasonal Recommendations */}
        {dashboardData.recommendations.seasonal.length > 0 && (
          <RecommendationCarousel
            userId={userId}
            recommendations={dashboardData.recommendations.seasonal}
            title="Seasonal Services"
            subtitle="Perfect for this time of year"
          />
        )}

        {/* Recent Activity */}
        {dashboardData.recentActivity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.service?.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={activity.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Personalized Offers */}
        <PersonalizedOffers 
          userId={userId}
          offers={dashboardData.recommendations.offers}
        />

        {/* Usage Insights Preview */}
        <UsageInsights 
          userId={userId}
          insights={dashboardData.analytics.usage}
          compact={true}
        />

        {/* Smart Scheduling */}
        <SmartScheduling 
          userId={userId}
          suggestions={dashboardData.analytics.scheduling}
        />
      </div>
    </div>
  );
}

function RecommendationsTab({ dashboardData, userId }: { dashboardData: DashboardData; userId: string }) {
  return (
    <div className="space-y-6">
      {/* Service Recommendations */}
      <SmartServiceGrid 
        userId={userId}
        recommendations={dashboardData.recommendations.services}
        title="AI-Curated Services"
        subtitle="Based on your preferences and behavior"
      />

      {/* Location-Based Suggestions */}
      <LocationBasedSuggestions
        userId={userId}
        suggestions={dashboardData.recommendations.location}
      />

      {/* Seasonal Recommendations */}
      <RecommendationCarousel
        userId={userId}
        recommendations={dashboardData.recommendations.seasonal}
        title="Seasonal Recommendations"
        subtitle="Services perfect for the current season"
      />

      {/* Personalized Offers */}
      <PersonalizedOffers 
        userId={userId}
        offers={dashboardData.recommendations.offers}
        expanded={true}
      />
    </div>
  );
}

function InsightsTab({ dashboardData, userId }: { dashboardData: DashboardData; userId: string }) {
  return (
    <div className="space-y-6">
      {/* Usage Insights */}
      <UsageInsights 
        userId={userId}
        insights={dashboardData.analytics.usage}
        compact={false}
      />

      {/* Personality Profile */}
      {dashboardData.user.insights?.personalityProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Your Service Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(dashboardData.user.insights.personalityProfile).map(([key, value]) => (
                <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </p>
                  <p className="text-lg font-semibold capitalize">{String(value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Categories */}
      {dashboardData.user.insights?.topCategories?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Your Favorite Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {dashboardData.user.insights.topCategories.map((category: string, index: number) => (
                <Badge key={category} variant={index === 0 ? 'default' : 'secondary'}>
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SettingsTab({ dashboardData, userId }: { dashboardData: DashboardData; userId: string }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personalization Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Customize your SewaGo experience with personalized recommendations and insights.
          </p>
          <Button variant="outline" className="w-full">
            Manage Preferences
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy & Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Control how your data is used for personalization.
          </p>
          <Button variant="outline" className="w-full">
            Privacy Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Utility function to get action icons
function getActionIcon(iconName: string) {
  const icons: Record<string, any> = {
    search: <TrendingUp className="w-4 h-4 mr-1" />,
    calendar: <Calendar className="w-4 h-4 mr-1" />,
    location: <MapPin className="w-4 h-4 mr-1" />,
    gift: <Gift className="w-4 h-4 mr-1" />,
    bookmark: <Star className="w-4 h-4 mr-1" />
  };
  
  return icons[iconName] || <Zap className="w-4 h-4 mr-1" />;
}

// Loading skeleton component
function PersonalizedDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 p-6 h-40">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="flex-1 h-10" />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}