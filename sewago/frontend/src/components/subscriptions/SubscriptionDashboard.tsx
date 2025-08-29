'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Star, 
  Calendar, 
  CreditCard, 
  Users, 
  TrendingUp,
  Gift,
  Shield,
  Zap,
  Clock,
  Phone,
  Heart
} from 'lucide-react';
import { TierBadge } from './TierBadge';
import { TierComparison } from './TierComparison';
import { BenefitTracker } from './BenefitTracker';
import { SubscriptionBilling } from './SubscriptionBilling';
import { FamilyPlanManager } from './FamilyPlanManager';
import { UpgradePrompt } from './UpgradePrompt';

interface SubscriptionData {
  id: string;
  tier: 'FREE' | 'PLUS' | 'PRO';
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
  startDate: string;
  nextBilling?: string;
  benefits: any[];
  usage: any[];
  familyPlan?: any;
}

interface SubscriptionDashboardProps {
  userId: string;
  initialData?: SubscriptionData;
}

export function SubscriptionDashboard({ userId, initialData }: SubscriptionDashboardProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchSubscriptionData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if we're in a build environment
      if (typeof window === 'undefined') {
        // Use mock data during build/SSR
        setSubscription(getMockSubscriptionData());
        return;
      }
      
      const response = await fetch(`/api/subscriptions?userId=${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setSubscription(data);
      } else {
        console.error('Failed to fetch subscription data:', data.error);
        // Fallback to mock data
        setSubscription(getMockSubscriptionData());
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      // Fallback to mock data
      setSubscription(getMockSubscriptionData());
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!initialData) {
      fetchSubscriptionData();
    }
  }, [initialData, fetchSubscriptionData]);

  // Mock data for build/fallback scenarios
  const getMockSubscriptionData = (): SubscriptionData => ({
    id: 'mock-sub-123',
    tier: 'FREE',
    status: 'ACTIVE',
    startDate: new Date().toISOString(),
    nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    benefits: [
      { id: '1', name: 'Basic Support', active: true },
      { id: '2', name: 'Standard Features', active: true }
    ],
    usage: [
      { id: '1', name: 'Service Bookings', used: 5, limit: 10 },
      { id: '2', name: 'Priority Support', used: 0, limit: 2 }
    ],
    familyPlan: null
  });

  const handleUpgrade = async (newTier: 'PLUS' | 'PRO') => {
    // This would trigger the upgrade flow
    console.log(`Upgrading to ${newTier}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-12">
        <Crown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Subscription Found</h3>
        <p className="text-gray-600 mb-6">Start your premium SewaGo experience today!</p>
        <Button onClick={() => setActiveTab('compare')} className="bg-blue-600 hover:bg-blue-700">
          View Plans
        </Button>
      </div>
    );
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'PRO':
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'PLUS':
        return <Star className="h-5 w-5 text-blue-500" />;
      default:
        return <Heart className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PRO':
        return 'from-yellow-400 to-orange-500';
      case 'PLUS':
        return 'from-blue-400 to-purple-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your SewaGo subscription and benefits</p>
        </div>
        <TierBadge tier={subscription.tier} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`bg-gradient-to-r ${getTierColor(subscription.tier)} text-white border-0`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Current Plan</p>
                  <p className="text-2xl font-bold">SewaGo {subscription.tier}</p>
                </div>
                {getTierIcon(subscription.tier)}
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
                  <p className="text-gray-600 text-sm">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className={subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                </div>
                <Shield className="h-5 w-5 text-green-500" />
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
                  <p className="text-gray-600 text-sm">Next Billing</p>
                  <p className="text-lg font-semibold">
                    {subscription.nextBilling 
                      ? new Date(subscription.nextBilling).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <Calendar className="h-5 w-5 text-blue-500" />
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
                  <p className="text-gray-600 text-sm">Active Benefits</p>
                  <p className="text-lg font-semibold">{subscription.benefits.length}</p>
                </div>
                <Gift className="h-5 w-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upgrade Prompt */}
      {subscription.tier !== 'PRO' && (
        <UpgradePrompt 
          currentTier={subscription.tier}
          onUpgrade={handleUpgrade}
        />
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="benefits" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Benefits
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Family
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Subscription Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Started</span>
                  <span className="font-medium">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </span>
                </div>
                {subscription.nextBilling && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Next Billing</span>
                    <span className="font-medium">
                      {new Date(subscription.nextBilling).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {subscription.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {subscription.tier !== 'PRO' && (
                  <Button 
                    onClick={() => handleUpgrade(subscription.tier === 'FREE' ? 'PLUS' : 'PRO')}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Subscription
                  </Button>
                )}
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab('billing')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Billing
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Preview */}
          <BenefitTracker userId={userId} subscription={subscription} preview />
        </TabsContent>

        <TabsContent value="benefits">
          <BenefitTracker userId={userId} subscription={subscription} />
        </TabsContent>

        <TabsContent value="billing">
          <SubscriptionBilling userId={userId} subscription={subscription} />
        </TabsContent>

        <TabsContent value="family">
          <FamilyPlanManager 
            userId={userId} 
            subscription={subscription}
            onUpdate={fetchSubscriptionData}
          />
        </TabsContent>

        <TabsContent value="compare">
          <TierComparison 
            currentTier={subscription.tier}
            onSelectTier={handleUpgrade}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}