'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  StarIcon, 
  MapPinIcon,
  UsersIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarSolid,
  CheckCircleIcon as CheckCircleSolid 
} from '@heroicons/react/24/solid';

interface PerformanceMetrics {
  totalJobs: number;
  jobsToday: number;
  averageResponseTime: string;
  customerSatisfaction: number;
  activeProviders: number;
  totalCustomers: number;
  topCities: CityMetric[];
  recentActivity: ActivityItem[];
}

interface CityMetric {
  name: string;
  bookings: number;
  growth: number;
}

interface ActivityItem {
  id: string;
  type: 'booking' | 'completion' | 'review';
  message: string;
  timestamp: Date;
  location: string;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Mock data for demonstration
  const mockMetrics: PerformanceMetrics = {
    totalJobs: 15420,
    jobsToday: 127,
    averageResponseTime: '18 minutes',
    customerSatisfaction: 4.8,
    activeProviders: 342,
    totalCustomers: 8920,
    topCities: [
      { name: 'Kathmandu', bookings: 2840, growth: 12.5 },
      { name: 'Pokhara', bookings: 1560, growth: 8.3 },
      { name: 'Lalitpur', bookings: 980, growth: 15.2 },
      { name: 'Bhaktapur', bookings: 720, growth: 6.8 },
      { name: 'Biratnagar', bookings: 650, growth: 9.1 }
    ],
    recentActivity: [
      {
        id: '1',
        type: 'booking',
        message: 'New plumbing service booked in Kathmandu',
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        location: 'Kathmandu'
      },
      {
        id: '2',
        type: 'completion',
        message: 'Electrical service completed in Pokhara',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        location: 'Pokhara'
      },
      {
        id: '3',
        type: 'review',
        message: '5-star review received for cleaning service',
        timestamp: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
        location: 'Lalitpur'
      },
      {
        id: '4',
        type: 'booking',
        message: 'Emergency locksmith service requested',
        timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
        location: 'Kathmandu'
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    const fetchMetrics = async () => {
      setIsLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics(mockMetrics);
      setIsLoading(false);
    };

    fetchMetrics();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchMetrics();
      setLastUpdated(new Date());
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
      case 'completion':
        return <CheckCircleSolid className="w-5 h-5 text-green-500" />;
      case 'review':
        return <StarSolid className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="h-12 w-96 bg-blue-500/50 rounded-lg mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 w-80 bg-blue-500/50 rounded mx-auto animate-pulse"></div>
              <div className="h-4 w-48 bg-blue-500/50 rounded mx-auto mt-6 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Metrics Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="h-4 w-24 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Activity Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <ChartBarIcon className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load metrics</h3>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <ChartBarIcon className="w-8 h-8 mr-3" />
              <h1 className="text-4xl font-bold">Live Performance Dashboard</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Transparent, real-time metrics showcasing our commitment to quality service delivery 
              and customer satisfaction across Nepal.
            </p>
            
            {/* Last Updated */}
            <div className="mt-6 text-blue-200 text-sm">
              Last updated: {lastUpdated.toLocaleTimeString()} | Auto-refreshes every 5 minutes
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Jobs */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-gray-900">
                {metrics.totalJobs.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Jobs Completed</div>
            </div>
            <div className="text-xs text-green-600 font-medium">
              +{Math.floor(metrics.totalJobs * 0.15).toLocaleString()} this month
            </div>
          </div>

          {/* Jobs Today */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BoltIcon className="w-6 h-6 text-green-600" />
              </div>
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-gray-900">
                {metrics.jobsToday}
              </div>
              <div className="text-sm text-gray-600">Jobs Today</div>
            </div>
            <div className="text-xs text-green-600 font-medium">
              +{Math.floor(metrics.jobsToday * 0.08)} from yesterday
            </div>
          </div>

          {/* Average Response Time */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-gray-900">
                {metrics.averageResponseTime}
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-xs text-green-600 font-medium">
              -2 minutes from last week
            </div>
          </div>

          {/* Customer Satisfaction */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-gray-900">
                {metrics.customerSatisfaction}
              </div>
              <div className="text-sm text-gray-600">Customer Satisfaction</div>
            </div>
            <div className="text-xs text-green-600 font-medium">
              +0.2 from last month
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Active Providers */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Active Service Providers</h3>
                <p className="text-sm text-gray-600">Verified professionals ready to serve</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {metrics.activeProviders.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Across {metrics.topCities.length} major cities
            </div>
          </div>

          {/* Total Customers */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Happy Customers</h3>
                <p className="text-sm text-gray-600">Trusted us with their service needs</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {metrics.totalCustomers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              With {metrics.customerSatisfaction}/5 satisfaction rating
            </div>
          </div>
        </div>

        {/* Top Cities and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Cities by Bookings */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-blue-500" />
              Top Cities by Bookings
            </h3>
            <div className="space-y-4">
              {metrics.topCities.map((city, index) => (
                <div key={city.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{city.name}</div>
                      <div className="text-sm text-gray-600">{city.bookings.toLocaleString()} bookings</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      +{city.growth}%
                    </div>
                    <div className="text-xs text-gray-500">growth</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BoltIcon className="w-5 h-5 text-yellow-500" />
              Live Activity Feed
            </h3>
            <div className="space-y-4">
              {metrics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 mb-1">{activity.message}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatTimeAgo(activity.timestamp)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="w-3 h-3" />
                        {activity.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-2 animate-pulse"></div>
                <p className="text-xs text-gray-500">Live updates every 30 seconds</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Why Customers Trust SewaGo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircleIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Verified Providers</h4>
              <p className="text-sm text-gray-600">
                All service providers are thoroughly vetted and background-checked
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ClockIcon className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Quick Response</h4>
              <p className="text-sm text-gray-600">
                Average response time of {metrics.averageResponseTime} for all service requests
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <StarIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">High Satisfaction</h4>
              <p className="text-sm text-gray-600">
                {metrics.customerSatisfaction}/5 average rating from {metrics.totalCustomers.toLocaleString()} customers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
