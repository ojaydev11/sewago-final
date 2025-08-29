'use client';

import React, { useState, useEffect } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  PersonalizationDashboardData, 
  ServiceRecommendation, 
  PersonalizedOffer,
  UsageInsight 
} from '@/types/personalization';
import {
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Gift,
  Target,
  MapPin,
  Zap,
  Users,
  Award,
  Heart,
  ShoppingCart,
  Eye,
  Settings,
  RefreshCw,
} from 'lucide-react';

interface PersonalizedDashboardProps {
  userId: string;
  className?: string;
  onActionClick?: (action: string, data?: any) => void;
}

export function PersonalizedDashboard({
  userId,
  className = '',
  onActionClick,
}: PersonalizedDashboardProps) {
  const intl = useIntl();
  const [dashboardData, setDashboardData] = useState<PersonalizationDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(`/api/personalization/dashboard?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleActionClick = (action: string, data?: any) => {
    // Track user behavior
    fetch('/api/personalization/behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action: 'click',
        clickTarget: action,
        category: 'dashboard',
      }),
    }).catch(console.error);

    // Trigger parent action handler
    onActionClick?.(action, data);
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="text-center space-y-4">
          <div className="text-red-500 text-sm">{error}</div>
          <Button onClick={() => loadDashboardData()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {intl.formatMessage({ id: 'dashboard.retry' })}
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
      {/* Header Section */}
      <DashboardHeader
        user={dashboardData.user}
        onRefresh={() => loadDashboardData(true)}
        refreshing={refreshing}
      />

      {/* Quick Actions */}
      <QuickActionsSection
        actions={dashboardData.quickActions}
        onActionClick={handleActionClick}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recommendations and Offers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Recommendations */}
          <ServiceRecommendationsSection
            services={dashboardData.recommendations.services}
            onServiceClick={(service: ServiceRecommendation) => handleActionClick('view_service', service)}
            onBookClick={(service: ServiceRecommendation) => handleActionClick('book_service', service)}
          />

          {/* Personalized Offers */}
          <PersonalizedOffersSection
            offers={dashboardData.recommendations.offers}
            onOfferClick={(offer: PersonalizedOffer) => handleActionClick('view_offer', offer)}
          />

          {/* Provider Recommendations */}
          <ProviderRecommendationsSection
            providers={dashboardData.recommendations.providers}
            onProviderClick={(provider: any) => handleActionClick('view_provider', provider)}
          />
        </div>

        {/* Right Column - Insights and Activity */}
        <div className="space-y-6">
          {/* Usage Insights */}
          <UsageInsightsSection
            insights={dashboardData.insights}
          />

          {/* Upcoming Bookings */}
          <UpcomingBookingsSection
            bookings={dashboardData.upcomingBookings}
            onBookingClick={(booking: any) => handleActionClick('view_booking', booking)}
          />

          {/* Goals */}
          <GoalsSection
            goals={dashboardData.goals}
            onGoalClick={(goal: any) => handleActionClick('view_goal', goal)}
          />

          {/* Recent Activity */}
          <RecentActivitySection
            activities={dashboardData.recentActivity}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Header Component
function DashboardHeader({ user, onRefresh, refreshing }: any) {
  const intl = useIntl();

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-blue-500 text-white text-lg">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {intl.formatMessage({ id: 'dashboard.welcome' }, { name: user.name })}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {user.tier} Member
                </Badge>
                <div className="flex items-center text-sm text-gray-600">
                  <Award className="h-4 w-4 mr-1" />
                  {user.points} points
                </div>
                <div className="text-sm text-gray-600">
                  {intl.formatMessage(
                    { id: 'dashboard.memberSince' },
                    { date: new Date(user.memberSince).toLocaleDateString() }
                  )}
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="ml-4"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {intl.formatMessage({ id: 'dashboard.refresh' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Actions Component
function QuickActionsSection({ actions, onActionClick }: any) {
  const intl = useIntl();

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'calendar': return <Calendar className="h-5 w-5" />;
      case 'refresh': return <RefreshCw className="h-5 w-5" />;
      case 'gift': return <Gift className="h-5 w-5" />;
      case 'user': return <Settings className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {intl.formatMessage({ id: 'dashboard.quickActions' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action: any, index: number) => (
            <motion.div
              key={action.action}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                onClick={() => onActionClick(action.action)}
              >
                {getActionIcon(action.icon)}
                <span className="text-xs text-center font-medium">{action.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Service Recommendations Component
function ServiceRecommendationsSection({ services, onServiceClick, onBookClick }: any) {
  const intl = useIntl();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="h-5 w-5 mr-2 text-blue-500" />
          {intl.formatMessage({ id: 'dashboard.recommendedServices' })}
        </CardTitle>
        <CardDescription>
          {intl.formatMessage({ id: 'dashboard.serviceRecommendationsDesc' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.slice(0, 4).map((service: ServiceRecommendation, index: number) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onServiceClick(service)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{service.name}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2">{service.description}</p>
                </div>
                <Badge variant="outline" className="ml-2 text-xs">
                  {Math.round(service.confidence * 100)}% match
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-xs text-gray-600">
                    <Star className="h-3 w-3 mr-1 text-yellow-500" />
                    {service.rating}
                  </div>
                  <div className="text-xs text-gray-600">
                    NPR {service.estimatedPrice.toLocaleString()}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookClick(service);
                  }}
                >
                  Book Now
                </Button>
              </div>

              <div className="mt-2 text-xs text-blue-600">
                {service.reasoning}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// More component definitions continue...
// (I'll create the rest in separate files for better organization)

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 bg-gray-200 rounded-lg"></div>
      <div className="h-32 bg-gray-200 rounded-lg"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

// Additional section components would be implemented here or in separate files
function PersonalizedOffersSection({ offers, onOfferClick }: any) {
  const intl = useIntl();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Gift className="h-5 w-5 mr-2 text-green-500" />
          {intl.formatMessage({ id: 'dashboard.personalizedOffers' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {offers.slice(0, 3).map((offer: PersonalizedOffer, index: number) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer bg-gradient-to-r from-green-50 to-blue-50"
              onClick={() => onOfferClick(offer)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{offer.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">{offer.description}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {offer.discountPercentage}% OFF
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Valid until {new Date(offer.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProviderRecommendationsSection({ providers, onProviderClick }: any) {
  const intl = useIntl();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-purple-500" />
          {intl.formatMessage({ id: 'dashboard.recommendedProviders' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {providers.slice(0, 3).map((provider: any, index: number) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => onProviderClick(provider)}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-purple-100 text-purple-700">
                    {provider.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{provider.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center text-xs">
                      <Star className="h-3 w-3 mr-1 text-yellow-500" />
                      {provider.rating.toFixed(1)}
                    </div>
                    {provider.distance && (
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="h-3 w-3 mr-1" />
                        {(provider.distance / 1000).toFixed(1)}km
                      </div>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {Math.round(provider.confidence * 100)}% match
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UsageInsightsSection({ insights }: { insights: UsageInsight }) {
  const intl = useIntl();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
          {intl.formatMessage({ id: 'dashboard.usageInsights' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{insights.totalBookings}</div>
            <div className="text-xs text-gray-600">This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              NPR {insights.totalSpent.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Total Spent</div>
          </div>
        </div>
        
        <div>
          <h5 className="text-sm font-medium mb-2">Favorite Categories</h5>
          <div className="space-y-2">
            {insights.favoriteCategories.slice(0, 3).map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-sm">
                <span className="capitalize">{cat.category}</span>
                <div className="flex items-center space-x-2">
                  <Progress value={cat.percentage} className="w-16 h-2" />
                  <span className="text-xs text-gray-600">{cat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingBookingsSection({ bookings, onBookingClick }: any) {
  const intl = useIntl();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-orange-500" />
          {intl.formatMessage({ id: 'dashboard.upcomingBookings' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            {intl.formatMessage({ id: 'dashboard.noUpcomingBookings' })}
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking: any) => (
              <div
                key={booking.id}
                className="border rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => onBookingClick(booking)}
              >
                <h4 className="font-semibold text-sm">{booking.serviceName}</h4>
                <p className="text-xs text-gray-600 mb-1">{booking.providerName}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-600">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(booking.scheduledAt).toLocaleDateString()}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {booking.status.toLowerCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GoalsSection({ goals, onGoalClick }: any) {
  const intl = useIntl();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2 text-red-500" />
          {intl.formatMessage({ id: 'dashboard.goals' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal: any) => (
          <div
            key={goal.title}
            className="border rounded-lg p-3 cursor-pointer hover:shadow-sm transition-shadow"
            onClick={() => onGoalClick(goal)}
          >
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-medium text-sm">{goal.title}</h5>
              <span className="text-xs text-gray-600">
                {goal.current}/{goal.target}
              </span>
            </div>
            <Progress value={(goal.current / goal.target) * 100} className="mb-2" />
            {goal.reward && (
              <p className="text-xs text-gray-600">{goal.reward}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentActivitySection({ activities }: any) {
  const intl = useIntl();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="h-5 w-5 mr-2 text-gray-500" />
          {intl.formatMessage({ id: 'dashboard.recentActivity' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity: any, index: number) => (
            <div key={index} className="flex items-start space-x-3 text-sm">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-xs">{activity.description}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}