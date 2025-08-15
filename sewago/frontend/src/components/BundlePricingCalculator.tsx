'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calculator, 
  Users, 
  Star, 
  Zap, 
  Gift
} from 'lucide-react';
import { 
  ServiceBundle, 
  calculateBundlePricing, 
  getBundleAvailability 
} from '@/lib/bundle-pricing';
import { formatNPR } from '@/lib/currency';

interface BundlePricingCalculatorProps {
  bundle: ServiceBundle;
  className?: string;
  onPriceChange?: (finalPrice: number) => void;
}

export default function BundlePricingCalculator({ 
  bundle, 
  className = '',
  onPriceChange 
}: BundlePricingCalculatorProps) {
  const [customerType, setCustomerType] = useState<'new' | 'returning' | 'vip'>('returning');
  const [referralCode, setReferralCode] = useState('');
  const [seasonalMultiplier, setSeasonalMultiplier] = useState(1.0);
  const [calculatedBundle, setCalculatedBundle] = useState<ServiceBundle>(bundle);
  const [availability, setAvailability] = useState(getBundleAvailability(bundle));

  // Recalculate pricing when inputs change
  useEffect(() => {
    const updatedBundle = calculateBundlePricing(
      bundle,
      customerType,
      referralCode || undefined,
      seasonalMultiplier
    );
    setCalculatedBundle(updatedBundle);
    
    if (onPriceChange) {
      onPriceChange(updatedBundle.discountedPrice);
    }
  }, [bundle, customerType, referralCode, seasonalMultiplier, onPriceChange]);

  // Update availability
  useEffect(() => {
    setAvailability(getBundleAvailability(bundle));
  }, [bundle]);

  const getSeasonalColor = (multiplier: number) => {
    if (multiplier < 0.9) return 'text-green-600';
    if (multiplier > 1.1) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Bundle Pricing Calculator
        </CardTitle>
        <CardDescription>
          Calculate your final price with available discounts and offers
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Bundle Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">{bundle.name}</h3>
            <Badge variant={bundle.isPopular ? "default" : "secondary"}>
              {bundle.isPopular ? 'Popular' : bundle.isLimited ? 'Limited Time' : 'Standard'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Base Price:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {formatNPR(bundle.basePrice)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Bundle Discount:</span>
              <span className="ml-2 font-semibold text-green-600">
                -{bundle.savingsPercentage}%
              </span>
            </div>
            <div>
              <span className="text-gray-600">Services:</span>
              <span className="ml-2 font-medium text-gray-900">
                {bundle.items.length} services
              </span>
            </div>
            <div>
              <span className="text-gray-600">Validity:</span>
              <span className="ml-2 font-medium text-gray-900">
                {bundle.validityDays} days
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Controls */}
        <div className="space-y-4">
          {/* Customer Type */}
          <div>
            <Label htmlFor="customer-type" className="text-sm font-medium">
              Customer Type
            </Label>
            <Select value={customerType} onValueChange={(value: any) => setCustomerType(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-600" />
                    New Customer (10% off)
                  </div>
                </SelectItem>
                <SelectItem value="returning">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    Returning Customer
                  </div>
                </SelectItem>
                <SelectItem value="vip">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-600" />
                    VIP Customer (15% off)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Referral Code */}
          <div>
            <Label htmlFor="referral-code" className="text-sm font-medium">
              Referral Code (Optional)
            </Label>
            <div className="mt-1 relative">
              <Input
                id="referral-code"
                placeholder="Enter referral code for 5% off"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />
              {referralCode && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Gift className="h-4 w-4 text-green-600" />
                </div>
              )}
            </div>
          </div>

          {/* Seasonal Pricing */}
          <div>
            <Label htmlFor="seasonal-multiplier" className="text-sm font-medium">
              Seasonal Pricing
            </Label>
            <Select 
              value={seasonalMultiplier.toString()} 
              onValueChange={(value) => setSeasonalMultiplier(parseFloat(value))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.8">Off-Peak Season (20% off)</SelectItem>
                <SelectItem value="0.9">Low Season (10% off)</SelectItem>
                <SelectItem value="1.0">Regular Season</SelectItem>
                <SelectItem value="1.1">High Season (+10%)</SelectItem>
                <SelectItem value="1.2">Peak Season (+20%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Price:</span>
              <span className="font-medium">{formatNPR(bundle.basePrice)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Bundle Discount:</span>
              <span className="font-medium text-green-600">
                -{formatNPR(bundle.savings)}
              </span>
            </div>

            {calculatedBundle.discounts.map((discount, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">{discount.description}:</span>
                <span className="font-medium text-green-600">
                  -{discount.type === 'percentage' ? `${discount.value}%` : formatNPR(discount.value)}
                </span>
              </div>
            ))}

            <div className="flex justify-between">
              <span className="text-gray-600">Seasonal Adjustment:</span>
              <span className={`font-medium ${getSeasonalColor(seasonalMultiplier)}`}>
                {seasonalMultiplier !== 1.0 ? 
                  `${seasonalMultiplier > 1 ? '+' : ''}${Math.round((seasonalMultiplier - 1) * 100)}%` : 
                  'None'
                }
              </span>
            </div>

            <div className="border-t border-blue-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Final Price:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatNPR(calculatedBundle.discountedPrice)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Total Savings:</span>
                <span className="font-medium text-green-600">
                  {formatNPR(calculatedBundle.savings)} ({calculatedBundle.savingsPercentage}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Availability</h4>
            <Badge variant={availability.isAvailable ? "default" : "destructive"}>
              {availability.isAvailable ? 'Available' : 'Fully Booked'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Remaining:</span>
              <span className="ml-2 font-medium text-gray-900">
                {availability.remainingBookings} bookings
              </span>
            </div>
            <div>
              <span className="text-gray-600">Expires in:</span>
              <span className="ml-2 font-medium text-gray-900">
                {availability.expiresIn} days
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Availability</span>
              <span>{availability.availabilityPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  availability.availabilityPercentage > 50 ? 'bg-green-500' :
                  availability.availabilityPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${availability.availabilityPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            className="flex-1" 
            disabled={!availability.isAvailable}
          >
            Book This Bundle
          </Button>
          <Button variant="outline" className="flex-1">
            Save for Later
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-center text-xs text-gray-500">
          <p>Prices are subject to change. Book now to lock in current rates.</p>
          {bundle.isLimited && (
            <p className="text-orange-600 font-medium mt-1">
              ⏰ Limited time offer - Book soon!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
