'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Gift, 
  Percent, 
  Phone, 
  Star, 
  Shield, 
  Crown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BenefitTrackerProps {
  userId: string;
  subscription: any;
  preview?: boolean;
}

interface BenefitData {
  currentTier: string;
  benefits: Array<{
    id: string;
    benefitType: string;
    value: any;
    utilizationPercentage: number;
    remainingUsage: number;
    isNearLimit: boolean;
    isActive: boolean;
  }>;
  usage: {
    bookingsCount: number;
    discountUsed: number;
    creditsUsed: number;
    supportTickets: number;
  };
  upgradeRecommendations: Array<{
    type: string;
    message: string;
    suggestedTier: string;
  }>;
}

export function BenefitTracker({ userId, subscription, preview = false }: BenefitTrackerProps) {
  const [benefitData, setBenefitData] = useState<BenefitData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBenefitData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if we're in a build environment
      if (typeof window === 'undefined') {
        // Use mock data during build/SSR
        setBenefitData(getMockBenefitData());
        return;
      }
      
      const response = await fetch(`/api/subscriptions/benefits?userId=${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setBenefitData(data);
      } else {
        console.error('Failed to fetch benefit data:', data.error);
        // Fallback to mock data
        setBenefitData(getMockBenefitData());
      }
    } catch (error) {
      console.error('Error fetching benefit data:', error);
      // Fallback to mock data
      setBenefitData(getMockBenefitData());
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBenefitData();
  }, [fetchBenefitData]);

  // Mock data for build/fallback scenarios
  const getMockBenefitData = (): BenefitData => ({
    currentTier: 'Basic',
    benefits: [
      {
        id: '1',
        benefitType: 'PRIORITY_SUPPORT',
        value: { level: 'standard' },
        utilizationPercentage: 75,
        remainingUsage: 100,
        isNearLimit: false,
        isActive: true,
      },
      {
        id: '2',
        benefitType: 'SERVICE_CREDITS',
        value: { amount: 1000 },
        utilizationPercentage: 50,
        remainingUsage: 500,
        isNearLimit: false,
        isActive: true,
      },
      {
        id: '3',
        benefitType: 'DISCOUNT_PERCENTAGE',
        value: { percentage: 10 },
        utilizationPercentage: 95,
        remainingUsage: 5,
        isNearLimit: true,
        isActive: true,
      },
    ],
    usage: {
      bookingsCount: 100,
      discountUsed: 10000,
      creditsUsed: 5000,
      supportTickets: 10,
    },
    upgradeRecommendations: [
      {
        type: 'DISCOUNT_PERCENTAGE',
        message: 'Upgrade to get 20% off on all bookings!',
        suggestedTier: 'PLUS',
      },
      {
        type: 'SERVICE_CREDITS',
        message: 'Get more service credits for your team!',
        suggestedTier: 'PRO',
      },
    ],
  });

  const getBenefitIcon = (benefitType: string) => {
    switch (benefitType) {
      case 'DISCOUNT_PERCENTAGE':
        return Percent;
      case 'SERVICE_CREDITS':
        return Gift;
      case 'PRIORITY_SUPPORT':
        return Phone;
      case 'EARLY_ACCESS':
        return Star;
      case 'BOOKING_GUARANTEE':
        return Shield;
      case 'CONCIERGE_SERVICE':
        return Crown;
      default:
        return Sparkles;
    }
  };

  const getBenefitColor = (benefitType: string) => {
    switch (benefitType) {
      case 'DISCOUNT_PERCENTAGE':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'SERVICE_CREDITS':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'PRIORITY_SUPPORT':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'EARLY_ACCESS':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'BOOKING_GUARANTEE':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'CONCIERGE_SERVICE':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatBenefitValue = (benefitType: string, value: any) => {
    switch (benefitType) {
      case 'DISCOUNT_PERCENTAGE':
        return `${value.percentage}% off`;
      case 'SERVICE_CREDITS':
        return `NPR ${Math.round(value.amount / 100)}`;
      case 'PRIORITY_SUPPORT':
        return value.level === 'premium' ? '24/7 Premium' : 'Priority';
      default:
        return 'Active';
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!benefitData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Gift className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Benefits Data</h3>
          <p className="text-gray-600">Unable to load your subscription benefits.</p>
        </CardContent>
      </Card>
    );
  }

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  if (preview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Benefits Usage This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefitData.benefits.slice(0, 3).map((benefit) => {
              const IconComponent = getBenefitIcon(benefit.benefitType);
              const colorClass = getBenefitColor(benefit.benefitType);
              
              return (
                <div key={benefit.id} className={cn('p-4 rounded-lg border', colorClass)}>
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent className="h-5 w-5" />
                    <span className="font-medium">
                      {benefit.benefitType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {formatBenefitValue(benefit.benefitType, benefit.value)}
                  </div>
                  {benefit.utilizationPercentage > 0 && (
                    <Progress 
                      value={benefit.utilizationPercentage} 
                      className="h-2"
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 text-center">
            <Button variant="outline" className="w-full">
              View All Benefits
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Benefits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  NPR {Math.round((benefitData.usage.discountUsed + benefitData.usage.creditsUsed) / 100)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bookings</p>
                <p className="text-2xl font-bold text-blue-600">
                  {benefitData.usage.bookingsCount}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Support Tickets</p>
                <p className="text-2xl font-bold text-purple-600">
                  {benefitData.usage.supportTickets}
                </p>
              </div>
              <Phone className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Benefits</p>
                <p className="text-2xl font-bold text-orange-600">
                  {benefitData.benefits.filter(b => b.isActive).length}
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Your Benefits for {currentMonth}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {benefitData.benefits.map((benefit, index) => {
            const IconComponent = getBenefitIcon(benefit.benefitType);
            const colorClass = getBenefitColor(benefit.benefitType);
            
            return (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'p-6 rounded-lg border-2 transition-all hover:shadow-md',
                  colorClass
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-white shadow-sm">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        {benefit.benefitType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Benefit Value</p>
                          <p className="text-xl font-bold">
                            {formatBenefitValue(benefit.benefitType, benefit.value)}
                          </p>
                        </div>
                        
                        {benefit.remainingUsage !== null && (
                          <div>
                            <p className="text-sm text-gray-600">Remaining</p>
                            <p className="text-xl font-bold">
                              {benefit.benefitType === 'SERVICE_CREDITS' 
                                ? `NPR ${Math.round(benefit.remainingUsage / 100)}`
                                : benefit.remainingUsage}
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <div className="flex items-center gap-2 mt-1">
                            {benefit.isActive ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                Inactive
                              </Badge>
                            )}
                            
                            {benefit.isNearLimit && (
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Near Limit
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {benefit.utilizationPercentage > 0 && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Usage This Month</span>
                            <span className="text-sm font-medium">
                              {Math.round(benefit.utilizationPercentage)}%
                            </span>
                          </div>
                          <Progress 
                            value={benefit.utilizationPercentage} 
                            className="h-3"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Upgrade Recommendations */}
      {benefitData.upgradeRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {benefitData.upgradeRecommendations.map((recommendation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-gray-900 mb-2">{recommendation.message}</p>
                    <Button 
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Upgrade to {recommendation.suggestedTier}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}