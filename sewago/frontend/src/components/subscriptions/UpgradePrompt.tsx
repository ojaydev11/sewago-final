'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Star, 
  X, 
  Zap,
  Gift,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Shield,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpgradePromptProps {
  currentTier: 'FREE' | 'PLUS' | 'PRO';
  onUpgrade: (tier: 'PLUS' | 'PRO') => void;
  context?: 'booking' | 'dashboard' | 'service' | 'support';
  dismissible?: boolean;
  compact?: boolean;
  className?: string;
}

const upgradeReasons = {
  FREE: {
    PLUS: [
      { icon: Gift, text: '15% discount on all services', highlight: 'Save money' },
      { icon: Star, text: 'NPR 100 monthly service credits', highlight: 'Free credits' },
      { icon: Zap, text: 'Priority customer support', highlight: 'Faster help' },
      { icon: TrendingUp, text: 'Advanced booking features', highlight: 'Better experience' }
    ],
    PRO: [
      { icon: Crown, text: '25% discount on all services', highlight: 'Maximum savings' },
      { icon: Sparkles, text: 'NPR 250 monthly service credits', highlight: 'More credits' },
      { icon: Shield, text: 'Premium 24/7 support', highlight: 'VIP treatment' },
      { icon: Users, text: 'Concierge booking assistance', highlight: 'Personal service' }
    ]
  },
  PLUS: {
    PRO: [
      { icon: Crown, text: 'Upgrade to 25% discount (from 15%)', highlight: '10% more savings' },
      { icon: Sparkles, text: 'Get NPR 250 credits (from NPR 100)', highlight: '150% more credits' },
      { icon: Shield, text: 'Premium 24/7 support', highlight: 'VIP treatment' },
      { icon: Users, text: 'Concierge booking assistance', highlight: 'Personal service' }
    ]
  }
};

const contextMessages = {
  booking: {
    FREE: 'Save 15% on this booking with SewaGo Plus!',
    PLUS: 'Get 25% off and premium support with SewaGo Pro!'
  },
  dashboard: {
    FREE: 'Unlock premium benefits and start saving on every service!',
    PLUS: 'Maximize your savings and get VIP treatment with Pro!'
  },
  service: {
    FREE: 'Get priority booking and discounts with SewaGo Plus!',
    PLUS: 'Enjoy premium guarantees and concierge service with Pro!'
  },
  support: {
    FREE: 'Get priority support and faster resolution with Plus!',
    PLUS: 'Access premium 24/7 support with dedicated assistance!'
  }
};

export function UpgradePrompt({ 
  currentTier, 
  onUpgrade, 
  context = 'dashboard',
  dismissible = true,
  compact = false,
  className 
}: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'PLUS' | 'PRO'>(
    currentTier === 'FREE' ? 'PLUS' : 'PRO'
  );

  if (dismissed || currentTier === 'PRO') {
    return null;
  }

  const availableTiers = currentTier === 'FREE' ? ['PLUS', 'PRO'] : ['PRO'];
  const reasons = upgradeReasons[currentTier];
  const contextMessage = contextMessages[context]?.[currentTier];

  const getTierConfig = (tier: 'PLUS' | 'PRO') => ({
    PLUS: {
      name: 'SewaGo Plus',
      price: 299,
      icon: Star,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      popular: currentTier === 'FREE'
    },
    PRO: {
      name: 'SewaGo Pro',
      price: 599,
      icon: Crown,
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-900',
      popular: true
    }
  }[tier]);

  if (compact) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn('relative', className)}
        >
          <Card className={cn(
            'border-2 overflow-hidden',
            getTierConfig(selectedTier).borderColor,
            getTierConfig(selectedTier).bgColor
          )}>
            {dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(true)}
                className="absolute right-2 top-2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-full bg-gradient-to-r',
                  getTierConfig(selectedTier).color
                )}>
                  {React.createElement(getTierConfig(selectedTier).icon, {
                    className: 'h-4 w-4 text-white'
                  })}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">
                    {contextMessage}
                  </div>
                  <div className="text-xs text-gray-600">
                    Starting at NPR {getTierConfig(selectedTier).price}/month
                  </div>
                </div>
                
                <Button 
                  size="sm"
                  onClick={() => onUpgrade(selectedTier)}
                  className={cn(
                    'bg-gradient-to-r',
                    getTierConfig(selectedTier).color,
                    'text-white border-0 hover:opacity-90'
                  )}
                >
                  Upgrade
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn('relative', className)}
      >
        <Card className="border-2 border-gradient-to-r from-blue-200 to-purple-200 overflow-hidden">
          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="absolute right-4 top-4 h-8 w-8 p-0 z-10"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  {currentTier === 'FREE' ? 'Unlock Premium Benefits' : 'Upgrade to Pro'}
                </h3>
                <p className="text-blue-100">
                  {contextMessage}
                </p>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {availableTiers.length > 1 && (
              <div className="flex justify-center mb-6">
                <div className="inline-flex p-1 bg-gray-100 rounded-lg">
                  {availableTiers.map((tier) => {
                    const config = getTierConfig(tier);
                    return (
                      <button
                        key={tier}
                        onClick={() => setSelectedTier(tier)}
                        className={cn(
                          'px-4 py-2 rounded-md text-sm font-medium transition-all',
                          selectedTier === tier
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        )}
                      >
                        {config.name}
                        {config.popular && (
                          <Badge className="ml-2 bg-blue-600 text-white text-xs px-1.5 py-0.5">
                            Popular
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Benefits */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">
                  What you'll get with {getTierConfig(selectedTier).name}:
                </h4>
                <div className="space-y-3">
                  {reasons[selectedTier]?.map((reason, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="p-2 bg-white rounded-full shadow-sm">
                        {React.createElement(reason.icon, {
                          className: 'h-4 w-4 text-blue-600'
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {reason.text}
                        </div>
                        <div className="text-xs text-blue-600 font-medium">
                          {reason.highlight}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="flex flex-col justify-center">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    NPR {getTierConfig(selectedTier).price}
                  </div>
                  <div className="text-gray-600">per month</div>
                  
                  {currentTier === 'FREE' && selectedTier === 'PRO' && (
                    <div className="mt-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Best Value - Save 30% vs individual services
                      </Badge>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => onUpgrade(selectedTier)}
                  className={cn(
                    'w-full h-12 text-lg font-semibold bg-gradient-to-r',
                    getTierConfig(selectedTier).color,
                    'text-white border-0 hover:opacity-90 shadow-lg'
                  )}
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Upgrade to {getTierConfig(selectedTier).name}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>

                <div className="text-center mt-4">
                  <div className="text-xs text-gray-500">
                    Cancel anytime • 7-day free trial for new users
                  </div>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>10,000+ happy subscribers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>4.9/5 rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>30-day money back guarantee</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Contextual upgrade prompts for specific use cases
export function BookingUpgradePrompt({ currentTier, estimatedSavings, onUpgrade }: {
  currentTier: 'FREE' | 'PLUS';
  estimatedSavings: number;
  onUpgrade: (tier: 'PLUS' | 'PRO') => void;
}) {
  const suggestedTier = currentTier === 'FREE' ? 'PLUS' : 'PRO';
  const discount = suggestedTier === 'PLUS' ? 15 : 25;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-full">
          <Gift className="h-5 w-5 text-green-600" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-green-900">
            Save NPR {Math.round(estimatedSavings * (discount / 100) / 100)} on this booking!
          </div>
          <div className="text-sm text-green-700">
            Upgrade to {suggestedTier} and get {discount}% off all services
          </div>
        </div>
        <Button 
          size="sm"
          onClick={() => onUpgrade(suggestedTier)}
          className="bg-green-600 hover:bg-green-700"
        >
          Upgrade & Save
        </Button>
      </div>
    </motion.div>
  );
}

export function SupportUpgradePrompt({ currentTier, onUpgrade }: {
  currentTier: 'FREE' | 'PLUS';
  onUpgrade: (tier: 'PLUS' | 'PRO') => void;
}) {
  const suggestedTier = currentTier === 'FREE' ? 'PLUS' : 'PRO';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
    >
      <div className="flex items-center gap-3">
        <Zap className="h-5 w-5 text-blue-600" />
        <div className="flex-1">
          <div className="font-medium text-blue-900">
            Get faster support with {suggestedTier}!
          </div>
          <div className="text-sm text-blue-700">
            {suggestedTier === 'PLUS' ? 'Priority support' : '24/7 premium support'} 
            with dedicated assistance
          </div>
        </div>
        <Button 
          size="sm"
          onClick={() => onUpgrade(suggestedTier)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Upgrade
        </Button>
      </div>
    </motion.div>
  );
}