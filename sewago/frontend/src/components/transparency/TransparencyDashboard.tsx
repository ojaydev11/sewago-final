'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import our transparency components
import LiveProviderTracker from './LiveProviderTracker';
import RealTimeServiceProfile from './RealTimeServiceProfile';
import TransparentPricingDisplay from './TransparentPricingDisplay';
import ServiceProgressTracker from './ServiceProgressTracker';
import ProviderLocationMap from './ProviderLocationMap';
import ProviderRouteOptimizer from './ProviderRouteOptimizer';
import LiveProviderMetrics from './LiveProviderMetrics';

import {
  Eye,
  MapPin,
  TrendingUp,
  Clock,
  Shield,
  Users,
  BarChart3,
  Route,
  DollarSign,
  Activity,
  Star,
  CheckCircle,
  RefreshCw,
  Settings
} from 'lucide-react';

interface TransparencyDashboardProps {
  bookingId?: string;
  providerId?: string;
  serviceId?: string;
  userLocation?: { lat: number; lng: number };
  demoMode?: boolean;
  className?: string;
}

export default function TransparencyDashboard({
  bookingId,
  providerId,
  serviceId,
  userLocation = { lat: 27.7172, lng: 85.3240 }, // Kathmandu default
  demoMode = false,
  className = ''
}: TransparencyDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Demo data for showcase
  const demoData = {
    booking: {
      id: 'demo-booking-123',
      service: 'House Cleaning',
      status: 'IN_PROGRESS',
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      customerLocation: { lat: 27.7172, lng: 85.3240 }
    },
    provider: {
      id: 'demo-provider-456',
      name: 'Rajesh Sharma',
      phone: '+977-9841234567',
      rating: 4.8,
      experience: '5 years',
      completionRate: 98,
      responseTime: '12 min',
      currentLocation: { lat: 27.7100, lng: 85.3200 }
    },
    service: {
      id: 'demo-service-789',
      name: 'Deep House Cleaning',
      category: 'house-cleaning',
      basePrice: 250000 // NPR 2500 in paisa
    }
  };

  const actualBookingId = bookingId || (demoMode ? demoData.booking.id : undefined);
  const actualProviderId = providerId || (demoMode ? demoData.provider.id : undefined);
  const actualServiceId = serviceId || (demoMode ? demoData.service.id : undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-6 w-6 text-blue-600" />
                <span>Transparency Dashboard</span>
                {demoMode && <Badge variant="outline">Demo Mode</Badge>}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Complete visibility into your service delivery process
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLiveMode(!isLiveMode)}
              >
                {isLiveMode ? (
                  <>
                    <Activity className="h-4 w-4 mr-1 text-green-500" />
                    Live Mode
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 text-gray-500" />
                    Paused
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {demoMode && (
          <CardContent>
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">🚀 Demo Showcase</h4>
              <p className="text-sm text-blue-700">
                This dashboard demonstrates SewaGo's complete transparency features. All data shown is simulated 
                to showcase real-time tracking, pricing transparency, and service progress monitoring capabilities.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Tracking</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center space-x-1">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Pricing</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center space-x-1">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Metrics</span>
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center space-x-1">
            <Route className="h-4 w-4" />
            <span className="hidden sm:inline">Routes</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Service Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {actualBookingId ? (
                  <ServiceProgressTracker
                    bookingId={actualBookingId}
                    compact={true}
                    showTimeline={false}
                    showQualityChecks={false}
                    showIssues={false}
                    allowCustomerActions={false}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No active booking to track</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Provider Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Provider Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {actualProviderId ? (
                  <RealTimeServiceProfile
                    providerId={actualProviderId}
                    compact={true}
                    showMetrics={true}
                    showCapacity={true}
                    showRecentActivity={false}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No provider assigned</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Live Map */}
          {actualProviderId && (
            <ProviderLocationMap
              providers={demoMode ? [demoData.provider] : []}
              customerLocation={userLocation}
              bookingId={actualBookingId}
              height="400px"
              showControls={true}
              showLegend={true}
              showRoutes={true}
            />
          )}
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {actualProviderId && (
                <LiveProviderTracker
                  providerId={actualProviderId}
                  bookingId={actualBookingId}
                  showMap={false}
                  showDetails={true}
                  compact={false}
                />
              )}
            </div>

            <div className="space-y-6">
              {actualProviderId && (
                <ProviderLocationMap
                  providers={demoMode ? [demoData.provider] : []}
                  customerLocation={userLocation}
                  bookingId={actualBookingId}
                  height="500px"
                  showControls={true}
                  showLegend={true}
                  showRoutes={true}
                />
              )}
            </div>
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          {actualBookingId ? (
            <ServiceProgressTracker
              bookingId={actualBookingId}
              showTimeline={true}
              showQualityChecks={true}
              showIssues={true}
              allowCustomerActions={true}
              compact={false}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Service</h3>
                <p className="text-gray-500 mb-4">Service progress tracking will appear here when you have an active booking.</p>
                {demoMode && (
                  <Button onClick={() => setActiveTab('overview')}>
                    View Demo Overview
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          {actualServiceId ? (
            <TransparentPricingDisplay
              serviceId={actualServiceId}
              location={userLocation}
              urgency="STANDARD"
              timeOfDay="NORMAL"
              showComparison={true}
              showHistory={true}
              showBreakdown={true}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Service Selected</h3>
                <p className="text-gray-500 mb-4">Transparent pricing breakdown will appear here when you select a service.</p>
                {demoMode && (
                  <div className="text-sm text-blue-600">
                    Demo pricing data is being generated...
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          {actualProviderId ? (
            <div className="space-y-6">
              <LiveProviderMetrics
                providerId={actualProviderId}
                timeWindow="24h"
                showTargets={true}
                showTrends={true}
                refreshInterval={refreshInterval}
              />

              <RealTimeServiceProfile
                providerId={actualProviderId}
                showMetrics={true}
                showCapacity={true}
                showRecentActivity={true}
                compact={false}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Provider Data</h3>
                <p className="text-gray-500 mb-4">Live performance metrics will appear here when a provider is assigned.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="routes" className="space-y-6">
          {actualProviderId && userLocation ? (
            <ProviderRouteOptimizer
              providerId={actualProviderId}
              origin={demoMode ? demoData.provider.currentLocation : { lat: 27.7100, lng: 85.3200 }}
              destination={userLocation}
              preferences={{
                prioritize: 'time',
                avoidTolls: false,
                avoidHighways: false,
                maxDetourTime: 15
              }}
              realTimeUpdates={isLiveMode}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Route className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Route Optimization Unavailable</h3>
                <p className="text-gray-500 mb-4">Route optimization will appear here when provider location is available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer Information */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Complete Transparency Guarantee</h4>
                <p className="text-sm text-gray-600">
                  All service activities are tracked and logged for your security and peace of mind
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span>{isLiveMode ? 'Live Updates Active' : 'Updates Paused'}</span>
              </div>
              <div className="mt-1">
                Refresh: {refreshInterval / 1000}s intervals
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}