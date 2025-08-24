'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTransparentPricing } from '@/hooks/useTransparentPricing';
import { 
  DollarSign, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  Info, 
  Calculator,
  Receipt,
  Percent,
  Tag,
  Gift,
  Clock,
  MapPin,
  Users,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface TransparentPricingDisplayProps {
  serviceId: string;
  location: { lat: number; lng: number };
  urgency?: 'STANDARD' | 'URGENT' | 'EMERGENCY';
  timeOfDay?: 'PEAK' | 'NORMAL' | 'OFF_PEAK';
  weatherConditions?: string;
  showComparison?: boolean;
  showHistory?: boolean;
  showBreakdown?: boolean;
  onPriceSelect?: (price: number) => void;
  className?: string;
}

export default function TransparentPricingDisplay({
  serviceId,
  location,
  urgency = 'STANDARD',
  timeOfDay = 'NORMAL',
  weatherConditions,
  showComparison = true,
  showHistory = true,
  showBreakdown = true,
  onPriceSelect,
  className = ''
}: TransparentPricingDisplayProps) {
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  
  const {
    pricingBreakdown,
    priceComparison,
    isLoading,
    error,
    calculatePricing,
    compareProviderPrices,
    formatPriceBreakdown,
    analyzePriceHistory
  } = useTransparentPricing();

  // Calculate pricing on mount and when parameters change
  useEffect(() => {
    const factors = {
      demand: 'MEDIUM' as const,
      timeOfDay,
      distance: 5, // Default distance
      urgency,
      weatherConditions,
      seasonalFactor: 0
    };

    calculatePricing(serviceId, location, factors);
    
    if (showComparison) {
      compareProviderPrices(serviceId, location, {
        minRating: 4.0,
        availableOnly: true
      });
    }
  }, [serviceId, location, urgency, timeOfDay, weatherConditions, calculatePricing, compareProviderPrices, showComparison]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ne-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY': return 'bg-red-100 text-red-800';
      case 'URGENT': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <div className="h-4 w-4" />;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-red-600';
    if (change < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !pricingBreakdown) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{error || 'Unable to calculate pricing'}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedBreakdown = formatPriceBreakdown(pricingBreakdown);
  const priceHistory = analyzePriceHistory(pricingBreakdown.priceHistory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Transparent Pricing</span>
            </CardTitle>
            <Badge className={getUrgencyColor(urgency)}>
              {urgency} Service
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Price Display */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-900 mb-2">
                {formatCurrency(pricingBreakdown.finalPrice)}
              </div>
              <div className="text-sm text-blue-700">
                Total Service Cost ({pricingBreakdown.currency})
              </div>
              
              {priceHistory && (
                <div className={`flex items-center justify-center space-x-2 mt-2 text-sm ${getPriceChangeColor(priceHistory.change)}`}>
                  {getPriceChangeIcon(priceHistory.change)}
                  <span>
                    {priceHistory.change !== 0 && (
                      <>
                        {priceHistory.change > 0 ? '+' : ''}
                        {formatCurrency(Math.abs(priceHistory.change))} ({priceHistory.changePercent.toFixed(1)}%)
                      </>
                    )}
                    {priceHistory.change === 0 && 'No change from last quote'}
                  </span>
                </div>
              )}

              {priceHistory?.isGoodTime && (
                <Badge className="bg-green-100 text-green-800 mt-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Good time to book - prices are stable
                </Badge>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          {showBreakdown && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center space-x-2">
                  <Receipt className="h-4 w-4" />
                  <span>Price Breakdown</span>
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                >
                  {showDetailedBreakdown ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Less Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      More Details
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                {formattedBreakdown.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      step.type === 'positive' ? 'bg-gray-50' :
                      step.type === 'negative' ? 'bg-green-50' : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {step.type === 'positive' && <DollarSign className="h-4 w-4 text-gray-600" />}
                      {step.type === 'negative' && <Gift className="h-4 w-4 text-green-600" />}
                      {step.type === 'neutral' && <Percent className="h-4 w-4 text-blue-600" />}
                      <span className="text-sm">{step.label}</span>
                    </div>
                    <div className={`font-medium ${
                      step.type === 'negative' ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {step.amount >= 0 ? '' : '-'}{formatCurrency(Math.abs(step.amount))}
                    </div>
                  </motion.div>
                ))}
                
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">{formatCurrency(formattedBreakdown.total)}</span>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showDetailedBreakdown && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 rounded-lg p-4 space-y-3"
                  >
                    <h5 className="font-medium flex items-center space-x-2">
                      <Info className="h-4 w-4" />
                      <span>Calculation Details</span>
                    </h5>
                    
                    {pricingBreakdown.calculation.map((calc, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium">{calc.step}</div>
                        <div className="text-gray-600">{calc.description}</div>
                        <div className="text-blue-600 font-semibold">{formatCurrency(calc.amount)}</div>
                      </div>
                    ))}
                    
                    {pricingBreakdown.providerCut && (
                      <div className="border-t pt-3 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Provider Earnings:</span>
                          <span className="ml-2 font-medium">{formatCurrency(pricingBreakdown.providerCut)}</span>
                        </div>
                        {pricingBreakdown.platformFee && (
                          <div>
                            <span className="text-gray-600">Platform Fee:</span>
                            <span className="ml-2 font-medium">{formatCurrency(pricingBreakdown.platformFee)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Price Comparison */}
          {showComparison && priceComparison.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Provider Price Comparison</span>
              </h4>
              
              <div className="space-y-3">
                {priceComparison.slice(0, 3).map((provider, index) => (
                  <motion.div
                    key={provider.providerId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      setSelectedProvider(provider.providerId);
                      onPriceSelect?.(provider.finalPrice);
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedProvider === provider.providerId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h5 className="font-medium">{provider.providerName}</h5>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < Math.floor(provider.rating)
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300 fill-current'
                                      }`}
                                    >
                                      ★
                                    </div>
                                  ))}
                                </div>
                                <span>{provider.rating.toFixed(1)}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{provider.responseTime}</span>
                              </div>
                              <span>•</span>
                              <span>{provider.completionRate}% completion</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(provider.finalPrice)}
                        </div>
                        {provider.basePrice !== provider.finalPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatCurrency(provider.basePrice)}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Price History & Trends */}
          {showHistory && priceHistory && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Price History & Trends</span>
              </h4>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">{formatCurrency(priceHistory.currentPrice)}</div>
                    <div className="text-sm text-gray-600">Current Price</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getPriceChangeColor(priceHistory.change)}`}>
                      {priceHistory.change !== 0 ? (
                        <>
                          {priceHistory.change > 0 ? '+' : ''}
                          {formatCurrency(priceHistory.change)}
                        </>
                      ) : (
                        'No change'
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Recent Change</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold capitalize">{priceHistory.trend}</div>
                    <div className="text-sm text-gray-600">Trend</div>
                  </div>
                  <div className="text-center">
                    <Badge className={priceHistory.isGoodTime ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {priceHistory.isGoodTime ? 'Good Time' : 'Wait & See'}
                    </Badge>
                    <div className="text-sm text-gray-600 mt-1">Booking Timing</div>
                  </div>
                </div>
                
                {/* Simple price history visualization */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Recent Price History</div>
                  <div className="flex items-end space-x-1 h-16">
                    {pricingBreakdown.priceHistory.slice(-7).map((price, index) => {
                      const maxPrice = Math.max(...pricingBreakdown.priceHistory.slice(-7).map(p => p.price));
                      const height = (price.price / maxPrice) * 100;
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-blue-500 rounded-t"
                            style={{ height: `${height}%` }}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(price.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Factors */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold flex items-center space-x-2 mb-3">
              <Calculator className="h-4 w-4" />
              <span>Pricing Factors</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Time:</span>
                <Badge variant="outline">{timeOfDay.replace('_', ' ')}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Urgency:</span>
                <Badge variant="outline">{urgency}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Location:</span>
                <span className="text-sm">Service Area</span>
              </div>
              {weatherConditions && (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 text-blue-600">🌤️</div>
                  <span className="text-gray-600">Weather:</span>
                  <span className="text-sm">{weatherConditions}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t">
            <Button 
              className="w-full"
              size="lg"
              onClick={() => onPriceSelect?.(pricingBreakdown.finalPrice)}
            >
              Proceed with {formatCurrency(pricingBreakdown.finalPrice)}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}