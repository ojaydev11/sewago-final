'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Heart, 
  Star, 
  Crown, 
  Check, 
  Gift, 
  Zap, 
  Phone, 
  Clock, 
  Users,
  Sparkles,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TierComparisonProps {
  currentTier: 'FREE' | 'PLUS' | 'PRO';
  onSelectTier: (tier: 'PLUS' | 'PRO') => void;
  showFamilyPlans?: boolean;
}

interface TierFeature {
  name: string;
  icon: React.ElementType;
  free: boolean | string;
  plus: boolean | string;
  pro: boolean | string;
  category: 'core' | 'support' | 'premium' | 'exclusive';
}

export function TierComparison({ 
  currentTier, 
  onSelectTier, 
  showFamilyPlans = true 
}: TierComparisonProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const tiers = {
    FREE: {
      name: 'SewaGo Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      icon: Heart,
      color: 'border-gray-200',
      bgColor: 'bg-white',
      textColor: 'text-gray-900',
      buttonColor: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      popular: false
    },
    PLUS: {
      name: 'SewaGo Plus',
      price: { monthly: 299, yearly: 2990 },
      description: 'Enhanced features for regular users',
      icon: Star,
      color: 'border-blue-200',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900',
      buttonColor: 'bg-blue-600 text-white hover:bg-blue-700',
      popular: true
    },
    PRO: {
      name: 'SewaGo Pro',
      price: { monthly: 599, yearly: 5990 },
      description: 'Premium experience for power users',
      icon: Crown,
      color: 'border-yellow-200',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      textColor: 'text-yellow-900',
      buttonColor: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600',
      popular: false
    }
  };

  const familyTiers = {
    PLUS_FAMILY: {
      name: 'SewaGo Plus Family',
      price: { monthly: 499, yearly: 4990 },
      description: 'Up to 4 family members',
      maxMembers: 4
    },
    PRO_FAMILY: {
      name: 'SewaGo Pro Family',
      price: { monthly: 899, yearly: 8990 },
      description: 'Up to 6 family members',
      maxMembers: 6
    }
  };

  const features: TierFeature[] = [
    // Core Features
    { name: 'Standard booking experience', icon: Check, free: true, plus: true, pro: true, category: 'core' },
    { name: 'Basic search functionality', icon: Check, free: true, plus: true, pro: true, category: 'core' },
    { name: 'Service reviews & ratings', icon: Check, free: true, plus: true, pro: true, category: 'core' },
    { name: 'Basic notifications', icon: Check, free: true, plus: true, pro: true, category: 'core' },
    
    // Plus Features
    { name: 'Service discount', icon: Gift, free: false, plus: '15%', pro: '25%', category: 'core' },
    { name: 'Monthly service credits', icon: Sparkles, free: false, plus: 'NPR 100', pro: 'NPR 250', category: 'core' },
    { name: 'Advanced booking scheduling', icon: Clock, free: false, plus: true, pro: true, category: 'core' },
    { name: 'Exclusive seasonal deals', icon: Gift, free: false, plus: true, pro: true, category: 'core' },
    { name: 'Enhanced notifications', icon: Zap, free: false, plus: true, pro: true, category: 'core' },
    
    // Support Features
    { name: 'Customer support', icon: Phone, free: 'Basic', plus: 'Priority', pro: 'Premium 24/7', category: 'support' },
    { name: 'Response time', icon: Clock, free: '24-48 hours', plus: '4-8 hours', pro: '1-2 hours', category: 'support' },
    
    // Pro Features
    { name: 'Unlimited service bookings', icon: Zap, free: false, plus: false, pro: true, category: 'premium' },
    { name: 'Advanced AI recommendations', icon: Sparkles, free: false, plus: false, pro: true, category: 'premium' },
    { name: 'Service bundling discounts', icon: Gift, free: false, plus: false, pro: true, category: 'premium' },
    { name: 'Premium service guarantees', icon: Shield, free: false, plus: false, pro: true, category: 'premium' },
    { name: 'Early access to new services', icon: Star, free: false, plus: false, pro: true, category: 'exclusive' },
    { name: 'Concierge booking assistance', icon: Users, free: false, plus: false, pro: true, category: 'exclusive' },
    { name: 'Provider preference guarantees', icon: Crown, free: false, plus: false, pro: true, category: 'exclusive' }
  ];

  const getFeatureValue = (feature: TierFeature, tier: 'free' | 'plus' | 'pro') => {
    const value = feature[tier];
    
    if (value === true) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    
    if (value === false) {
      return <X className="h-4 w-4 text-gray-300" />;
    }
    
    return <span className="text-sm font-medium text-gray-700">{value}</span>;
  };

  const getSavingsPercentage = (tier: 'PLUS' | 'PRO') => {
    const monthly = tiers[tier].price.monthly;
    const yearly = tiers[tier].price.yearly;
    const monthlyCost = monthly * 12;
    return Math.round(((monthlyCost - yearly) / monthlyCost) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your SewaGo Plan
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Unlock premium features and save more on every service
        </p>
        
        {/* Billing Toggle */}
        <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              billingCycle === 'monthly' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all relative',
              billingCycle === 'yearly' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Yearly
            <Badge className="absolute -top-2 -right-2 bg-green-100 text-green-800 text-xs px-1.5 py-0.5">
              Save 10%
            </Badge>
          </button>
        </div>
      </div>

      {/* Individual Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(tiers).map(([tierKey, tier]) => {
          const isCurrentTier = currentTier === tierKey;
          const price = tier.price[billingCycle];
          const IconComponent = tier.icon;
          
          return (
            <motion.div
              key={tierKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * Object.keys(tiers).indexOf(tierKey) }}
              className="relative"
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={cn(
                'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
                tier.color,
                tier.bgColor,
                tier.popular && 'ring-2 ring-blue-500 ring-opacity-50 scale-105'
              )}>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className={cn(
                      'p-3 rounded-full',
                      tierKey === 'PRO' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      tierKey === 'PLUS' ? 'bg-gradient-to-r from-blue-500 to-purple-600' :
                      'bg-gray-200'
                    )}>
                      <IconComponent className={cn(
                        'h-6 w-6',
                        tierKey === 'FREE' ? 'text-gray-600' : 'text-white'
                      )} />
                    </div>
                  </div>
                  
                  <CardTitle className={tier.textColor}>
                    {tier.name}
                  </CardTitle>
                  
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      NPR {price}
                    </span>
                    {tierKey !== 'FREE' && (
                      <span className="text-gray-600">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mt-2">{tier.description}</p>
                  
                  {billingCycle === 'yearly' && tierKey !== 'FREE' && (
                    <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                      Save {getSavingsPercentage(tierKey as 'PLUS' | 'PRO')}%
                    </Badge>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="space-y-3 mb-6">
                    {features
                      .filter(feature => {
                        const tierValue = feature[tierKey.toLowerCase() as 'free' | 'plus' | 'pro'];
                        return tierValue !== false;
                      })
                      .slice(0, 6)
                      .map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {React.createElement(feature.icon, { className: "h-4 w-4 text-gray-400" })}
                          <span className="text-sm text-gray-700">{feature.name}</span>
                          {feature[tierKey.toLowerCase() as 'free' | 'plus' | 'pro'] !== true && (
                            <Badge variant="outline" className="ml-auto text-xs">
                              {feature[tierKey.toLowerCase() as 'free' | 'plus' | 'pro']}
                            </Badge>
                          )}
                        </div>
                      ))}
                  </div>

                  <Button
                    onClick={() => tierKey !== 'FREE' && onSelectTier(tierKey as 'PLUS' | 'PRO')}
                    disabled={isCurrentTier || tierKey === 'FREE'}
                    className={cn('w-full', tier.buttonColor)}
                  >
                    {isCurrentTier ? 'Current Plan' : 
                     tierKey === 'FREE' ? 'Always Free' :
                     `Upgrade to ${tier.name}`}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Family Plans */}
      {showFamilyPlans && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Family Plans</h3>
            <p className="text-gray-600">Share premium benefits with your family members</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {Object.entries(familyTiers).map(([planKey, plan]) => (
              <motion.div
                key={planKey}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    
                    <CardTitle className="text-purple-900">{plan.name}</CardTitle>
                    
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">
                        NPR {plan.price[billingCycle]}
                      </span>
                      <span className="text-gray-600">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mt-2">{plan.description}</p>
                    
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                        Up to {plan.maxMembers} members
                      </Badge>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                        Shared credits
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">All {planKey.includes('PRO') ? 'Pro' : 'Plus'} benefits for all members</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">Shared service credits pool</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">Family dashboard</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">Easy member management</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => onSelectTier(planKey.includes('PRO') ? 'PRO' : 'PLUS')}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Start Family Plan
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Comparison Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Detailed Feature Comparison</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Features</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Free</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Plus</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {features.map((feature, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {React.createElement(feature.icon, { className: "h-4 w-4 text-gray-400" })}
                      <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">{getFeatureValue(feature, 'free')}</td>
                  <td className="px-6 py-4 text-center">{getFeatureValue(feature, 'plus')}</td>
                  <td className="px-6 py-4 text-center">{getFeatureValue(feature, 'pro')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}