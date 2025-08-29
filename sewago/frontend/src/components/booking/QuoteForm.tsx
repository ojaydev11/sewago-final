'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
<<<<<<< HEAD
import { Clock, MapPin, Shield, Zap, Calculator, User, Phone } from 'lucide-react';
=======
import { Clock, MapPin, Shield, Zap, Calculator, User, Phone, Crown, Gift } from 'lucide-react';
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
import { pricingEngine } from '@/lib/pricing';
import { pricing as pricingConfig } from '@/config/pricing';
import { formatNPR } from '@/lib/currency';
import { getServicePromises } from '@/lib/service-promises';
<<<<<<< HEAD
=======
import { calculateServicePrice, type SubscriptionTier } from '@/lib/subscription-pricing';
import { TierBadge } from '@/components/subscriptions/TierBadge';
import { BookingUpgradePrompt } from '@/components/subscriptions/UpgradePrompt';
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

interface QuoteFormProps {
  serviceSlug: string;
  serviceName: string;
  basePrice: number;
  onQuoteUpdate: (quote: QuoteData) => void;
}

export interface QuoteData {
  customerName: string;
  phone: string;
  address: string;
  area: string;
  preferredTime: string;
  notes: string;
  isExpress: boolean;
  hasWarranty: boolean;
  totalPrice: number;
  breakdown: PriceBreakdown;
}

interface PriceBreakdown {
  basePrice: number;
  extraBlocks: number;
  extraBlockPrice: number;
  expressSurcharge: number;
  warrantyFee: number;
  bookingFee: number;
  coinsCap: number;
  total: number;
}

const TIME_WINDOWS = [
  '30-60 minutes',
  '1-2 hours later',
  '2-4 hours later',
  'Same day (evening)',
  'Next day morning'
];

export default function QuoteForm({ serviceSlug, serviceName, basePrice, onQuoteUpdate }: QuoteFormProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    area: '',
    preferredTime: TIME_WINDOWS[0],
    notes: ''
  });

  const [options, setOptions] = useState({
    isExpress: false,
    hasWarranty: false
  });

  const [extraBlocks, setExtraBlocks] = useState<number>(0);
<<<<<<< HEAD
=======
  
  // Mock subscription data - in real app, this would come from auth context
  // Mock subscription data - in real app, this would come from auth context
  const userTier = 'PLUS' as SubscriptionTier; // This would be fetched from user's subscription - mock for now
  const isAuthenticated = true; // This would come from auth context
  const availableCredits = 15000; // NPR 150 in paisa - from user's subscription
  const [useCredits, setUseCredits] = useState(false);
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown>({
    basePrice: basePrice,
    extraBlocks: 0,
    extraBlockPrice: 0,
    expressSurcharge: 0,
    warrantyFee: 0,
    bookingFee: pricingConfig.bookingFee,
    coinsCap: 0,
    total: basePrice + pricingConfig.bookingFee
  });

  // Calculate pricing when options change
  useEffect(() => {
    // Determine extra-15 min price per service if available, else default 150
    const servicePricing = pricingConfig.services as any;
    const extraBlockPrice = servicePricing?.[serviceSlug]?.extra15 ?? 150;
    const extras = extraBlocks * extraBlockPrice;

    const expressSurcharge = options.isExpress ? pricingConfig.expressAddon.price : 0;
    const warrantyFee = options.hasWarranty
      ? (pricingConfig.warrantyAddon?.price ?? Math.round(basePrice * 0.15))
      : 0;
    const bookingFee = pricingConfig.bookingFee;
    const coinsCap = Math.round((basePrice + extras + expressSurcharge + warrantyFee) * (pricingConfig.coins.maxRedeemPctOnLabour ?? 0.1));

<<<<<<< HEAD
    const total = basePrice + extras + expressSurcharge + warrantyFee + bookingFee;
=======
    // Calculate total before subscription discounts
    const subtotal = basePrice + extras + expressSurcharge + warrantyFee + bookingFee;
    
    // Apply subscription pricing if user is authenticated
    let finalPricing = {
      originalPrice: subtotal,
      discountedPrice: subtotal,
      discountAmount: 0,
      discountPercentage: 0,
      creditsApplied: 0,
      finalPrice: subtotal,
      savings: 0
    };

    if (isAuthenticated) {
      finalPricing = calculateServicePrice(
        subtotal,
        userTier,
        useCredits ? availableCredits : 0,
        useCredits
      );
    }
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

    const newBreakdown: PriceBreakdown = {
      basePrice: basePrice,
      extraBlocks,
      extraBlockPrice,
      expressSurcharge,
      warrantyFee,
      bookingFee,
      coinsCap,
<<<<<<< HEAD
      total
    };
=======
      total: finalPricing.finalPrice,
      // Add subscription-specific fields
      subscriptionDiscount: finalPricing.discountAmount,
      creditsUsed: finalPricing.creditsApplied,
      originalTotal: subtotal,
      totalSavings: finalPricing.savings
    } as any;
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

    setPriceBreakdown(newBreakdown);

    onQuoteUpdate({
      ...formData,
      ...options,
<<<<<<< HEAD
      totalPrice: newBreakdown.total,
      breakdown: newBreakdown
    });
  }, [options, basePrice, extraBlocks, formData, onQuoteUpdate, serviceSlug]);
=======
      totalPrice: finalPricing.finalPrice,
      breakdown: newBreakdown
    });
  }, [options, basePrice, extraBlocks, formData, onQuoteUpdate, serviceSlug, isAuthenticated, userTier, useCredits, availableCredits]);
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (option: string, value: boolean) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Get Your Quote
        </CardTitle>
        <CardDescription>
          Fill in your details and see transparent pricing for {serviceName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name *
            </Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+977-XXXXXXXXX"
              required
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Complete Address *
          </Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Street address, building, floor, room number"
            className="min-h-[80px]"
            required
          />
        </div>

        {/* Area */}
        <div>
          <Label htmlFor="area" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Area/Location *
          </Label>
          <Input
            id="area"
            value={formData.area}
            onChange={(e) => handleInputChange('area', e.target.value)}
            placeholder="e.g., Thamel, Baneshwor, Lalitpur"
            required
          />
        </div>

        {/* Time Window */}
        <div>
          <Label htmlFor="preferredTime" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Preferred Time Window *
          </Label>
          <select
            id="preferredTime"
            value={formData.preferredTime}
            onChange={(e) => handleInputChange('preferredTime', e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {TIME_WINDOWS.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* Service Options */}
        <div className="space-y-4">
          <div>
            <Label className="font-medium">Estimated Duration</Label>
            <p className="text-sm text-gray-600 mb-2">Base includes 30 minutes. Add extra 15-minute blocks if needed.</p>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => setExtraBlocks(Math.max(0, extraBlocks - 1))}>
                -15m
              </Button>
              <span className="min-w-[120px] text-center text-sm">
                Extra: {extraBlocks} x 15m ({formatNPR(priceBreakdown.extraBlockPrice)} each)
              </span>
              <Button type="button" variant="outline" onClick={() => setExtraBlocks(extraBlocks + 1)}>
                +15m
              </Button>
            </div>
          </div>
          <h4 className="font-medium text-gray-900">Service Options</h4>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-orange-500" />
              <div>
                <Label htmlFor="express" className="font-medium">Express Service</Label>
                <p className="text-sm text-gray-600">Get priority scheduling</p>
              </div>
            </div>
            <Switch
              id="express"
              checked={options.isExpress}
              onCheckedChange={(checked) => handleOptionChange('isExpress', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <Label htmlFor="warranty" className="font-medium">Extended Warranty</Label>
                <p className="text-sm text-gray-600">15% extra for peace of mind</p>
              </div>
            </div>
            <Switch
              id="warranty"
              checked={options.hasWarranty}
              onCheckedChange={(checked) => handleOptionChange('hasWarranty', checked)}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any special instructions or requirements"
            className="min-h-[80px]"
          />
        </div>

<<<<<<< HEAD
=======
        {/* Subscription Status and Credits */}
        {isAuthenticated && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Crown className="h-4 w-4 text-purple-600" />
                Your Subscription Benefits
              </h4>
              <TierBadge tier={userTier} size="sm" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {userTier !== 'FREE' && (
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-green-600" />
                  <span>
                    {userTier === 'PLUS' ? '15%' : '25%'} member discount applied
                  </span>
                </div>
              )}
              
              {availableCredits > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-purple-600" />
                    <span>Service Credits: {formatNPR(availableCredits)}</span>
                  </div>
                  <Switch
                    checked={useCredits}
                    onCheckedChange={setUseCredits}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upgrade Prompt for FREE users */}
        {isAuthenticated && userTier === 'FREE' && (
          <BookingUpgradePrompt 
            currentTier={userTier}
            estimatedSavings={(priceBreakdown as any).originalTotal || priceBreakdown.total}
            onUpgrade={(tier) => console.log(`Upgrade to ${tier}`)}
          />
        )}

>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
        {/* Price Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-gray-900">Price Breakdown</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Base Price (30 min):</span>
              <span>{formatNPR(priceBreakdown.basePrice)}</span>
            </div>
            {priceBreakdown.extraBlocks > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Extra {priceBreakdown.extraBlocks} x 15 min:</span>
                <span>+{formatNPR(priceBreakdown.extraBlocks * priceBreakdown.extraBlockPrice)}</span>
              </div>
            )}
            {options.isExpress && (
              <div className="flex justify-between text-orange-600">
                <span>Express Surcharge:</span>
                <span>+{formatNPR(priceBreakdown.expressSurcharge)}</span>
              </div>
            )}
            {options.hasWarranty && (
              <div className="flex justify-between text-blue-600">
                <span>Warranty Fee:</span>
                <span>+{formatNPR(priceBreakdown.warrantyFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Booking Fee:</span>
              <span>{formatNPR(priceBreakdown.bookingFee)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Coins Cap (≤10%):</span>
              <span>-{formatNPR(priceBreakdown.coinsCap)}</span>
            </div>
<<<<<<< HEAD
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span className="text-primary">{formatNPR(priceBreakdown.total)}</span>
              </div>
=======
            
            {/* Subscription Pricing */}
            {isAuthenticated && (priceBreakdown as any).originalTotal && (
              <>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>{formatNPR((priceBreakdown as any).originalTotal)}</span>
                  </div>
                </div>
                
                {(priceBreakdown as any).subscriptionDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      {userTier} Discount ({userTier === 'PLUS' ? '15%' : '25%'}):
                    </span>
                    <span>-{formatNPR((priceBreakdown as any).subscriptionDiscount)}</span>
                  </div>
                )}
                
                {(priceBreakdown as any).creditsUsed > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span className="flex items-center gap-1">
                      <Gift className="h-3 w-3" />
                      Service Credits Applied:
                    </span>
                    <span>-{formatNPR((priceBreakdown as any).creditsUsed)}</span>
                  </div>
                )}
                
                {(priceBreakdown as any).totalSavings > 0 && (
                  <div className="flex justify-between text-green-700 bg-green-50 p-2 rounded font-medium">
                    <span>Your Total Savings:</span>
                    <span>-{formatNPR((priceBreakdown as any).totalSavings)}</span>
                  </div>
                )}
              </>
            )}
            
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>Final Total:</span>
                <span className="text-primary">{formatNPR(priceBreakdown.total)}</span>
              </div>
              {isAuthenticated && (priceBreakdown as any).originalTotal && (priceBreakdown as any).originalTotal > priceBreakdown.total && (
                <div className="text-xs text-gray-500 text-right">
                  Regular price: <span className="line-through">{formatNPR((priceBreakdown as any).originalTotal)}</span>
                </div>
              )}
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">We accept:</p>
          <div className="flex justify-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              💰 Cash on Delivery
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              📱 eSewa
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              🏦 Khalti
            </Badge>
          </div>
        </div>

        {/* Service Promises */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-xl">🤝</span>
            Our Promise to You
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {getServicePromises(serviceSlug).slice(0, 4).map((promise) => (
              <div key={promise.id} className="flex items-center gap-2">
                <span className="text-lg">{promise.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">{promise.title}</div>
                  <div className="text-gray-600">{promise.guarantee}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
