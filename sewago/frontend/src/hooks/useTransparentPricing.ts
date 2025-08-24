'use client';

import { useState, useCallback, useEffect } from 'react';

interface PricingBreakdown {
  basePrice: number;
  taxes: Record<string, number>;
  fees: Record<string, number>;
  discounts: Record<string, number>;
  subscriptionDiscount: number;
  finalPrice: number;
  currency: string;
  calculation: Array<{
    step: string;
    amount: number;
    description: string;
  }>;
  priceHistory: Array<{
    date: string;
    price: number;
    reason?: string;
  }>;
  providerCut?: number;
  platformFee?: number;
}

interface PriceComparison {
  providerId: string;
  providerName: string;
  basePrice: number;
  finalPrice: number;
  rating: number;
  responseTime: string;
  completionRate: number;
}

interface PricingFactors {
  demand: 'LOW' | 'MEDIUM' | 'HIGH';
  timeOfDay: 'PEAK' | 'NORMAL' | 'OFF_PEAK';
  distance: number;
  urgency: 'STANDARD' | 'URGENT' | 'EMERGENCY';
  weatherConditions?: string;
  seasonalFactor?: number;
}

export function useTransparentPricing() {
  const [pricingBreakdown, setPricingBreakdown] = useState<PricingBreakdown | null>(null);
  const [priceComparison, setPriceComparison] = useState<PriceComparison[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate transparent pricing for a service
  const calculatePricing = useCallback(async (
    serviceId: string,
    location: { lat: number; lng: number },
    factors?: Partial<PricingFactors>
  ): Promise<PricingBreakdown> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pricing/transparency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          location,
          factors: factors || {}
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate pricing');
      }

      const breakdown: PricingBreakdown = await response.json();
      setPricingBreakdown(breakdown);
      setIsLoading(false);
      
      return breakdown;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Pricing calculation failed';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  }, []);

  // Get price comparison across providers
  const compareProviderPrices = useCallback(async (
    serviceId: string,
    location: { lat: number; lng: number },
    filters?: {
      minRating?: number;
      maxDistance?: number;
      availableOnly?: boolean;
    }
  ): Promise<PriceComparison[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        serviceId,
        lat: location.lat.toString(),
        lng: location.lng.toString(),
        ...filters
      });

      const response = await fetch(`/api/pricing/comparison?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch price comparison');
      }

      const comparison: PriceComparison[] = await response.json();
      setPriceComparison(comparison);
      setIsLoading(false);
      
      return comparison;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Price comparison failed';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  }, []);

  // Calculate dynamic pricing based on real-time factors
  const calculateDynamicPrice = useCallback(async (
    basePrice: number,
    factors: PricingFactors
  ): Promise<{ newPrice: number; adjustments: Array<{ factor: string; adjustment: number; reason: string }> }> => {
    const adjustments: Array<{ factor: string; adjustment: number; reason: string }> = [];
    let newPrice = basePrice;

    // Demand-based pricing
    switch (factors.demand) {
      case 'HIGH':
        const demandIncrease = basePrice * 0.2;
        newPrice += demandIncrease;
        adjustments.push({
          factor: 'High Demand',
          adjustment: demandIncrease,
          reason: 'High demand in your area increases pricing'
        });
        break;
      case 'LOW':
        const demandDecrease = basePrice * 0.1;
        newPrice -= demandDecrease;
        adjustments.push({
          factor: 'Low Demand',
          adjustment: -demandDecrease,
          reason: 'Low demand in your area reduces pricing'
        });
        break;
    }

    // Time-based pricing
    switch (factors.timeOfDay) {
      case 'PEAK':
        const peakIncrease = basePrice * 0.15;
        newPrice += peakIncrease;
        adjustments.push({
          factor: 'Peak Hours',
          adjustment: peakIncrease,
          reason: 'Peak hours surcharge applied'
        });
        break;
      case 'OFF_PEAK':
        const offPeakDecrease = basePrice * 0.05;
        newPrice -= offPeakDecrease;
        adjustments.push({
          factor: 'Off-Peak Hours',
          adjustment: -offPeakDecrease,
          reason: 'Off-peak hours discount applied'
        });
        break;
    }

    // Urgency pricing
    switch (factors.urgency) {
      case 'URGENT':
        const urgentIncrease = basePrice * 0.3;
        newPrice += urgentIncrease;
        adjustments.push({
          factor: 'Urgent Service',
          adjustment: urgentIncrease,
          reason: 'Urgent service premium applied'
        });
        break;
      case 'EMERGENCY':
        const emergencyIncrease = basePrice * 0.5;
        newPrice += emergencyIncrease;
        adjustments.push({
          factor: 'Emergency Service',
          adjustment: emergencyIncrease,
          reason: 'Emergency service premium applied'
        });
        break;
    }

    // Distance-based pricing
    if (factors.distance > 5) { // More than 5km
      const distanceIncrease = (factors.distance - 5) * 50; // NPR 50 per km
      newPrice += distanceIncrease;
      adjustments.push({
        factor: 'Distance Charge',
        adjustment: distanceIncrease,
        reason: `Additional charge for ${factors.distance}km distance`
      });
    }

    // Weather conditions
    if (factors.weatherConditions && ['rain', 'storm', 'extreme'].includes(factors.weatherConditions)) {
      const weatherIncrease = basePrice * 0.1;
      newPrice += weatherIncrease;
      adjustments.push({
        factor: 'Weather Conditions',
        adjustment: weatherIncrease,
        reason: 'Additional charge due to adverse weather conditions'
      });
    }

    // Seasonal factors
    if (factors.seasonalFactor) {
      const seasonalAdjustment = basePrice * factors.seasonalFactor;
      newPrice += seasonalAdjustment;
      adjustments.push({
        factor: 'Seasonal Adjustment',
        adjustment: seasonalAdjustment,
        reason: seasonalAdjustment > 0 ? 'Seasonal price increase' : 'Seasonal discount applied'
      });
    }

    return { newPrice: Math.round(newPrice), adjustments };
  }, []);

  // Format price breakdown for display
  const formatPriceBreakdown = useCallback((breakdown: PricingBreakdown) => {
    const steps = [
      {
        label: 'Base Service Price',
        amount: breakdown.basePrice,
        type: 'positive' as const
      }
    ];

    // Add taxes
    Object.entries(breakdown.taxes).forEach(([taxName, amount]) => {
      steps.push({
        label: taxName,
        amount: amount,
        type: 'neutral' as const
      });
    });

    // Add fees
    Object.entries(breakdown.fees).forEach(([feeName, amount]) => {
      steps.push({
        label: feeName,
        amount: amount,
        type: 'neutral' as const
      });
    });

    // Add discounts
    Object.entries(breakdown.discounts).forEach(([discountName, amount]) => {
      steps.push({
        label: discountName,
        amount: -amount,
        type: 'negative' as const
      });
    });

    // Add subscription discount
    if (breakdown.subscriptionDiscount > 0) {
      steps.push({
        label: 'Subscription Discount',
        amount: -breakdown.subscriptionDiscount,
        type: 'negative' as const
      });
    }

    return {
      steps,
      total: breakdown.finalPrice,
      currency: breakdown.currency
    };
  }, []);

  // Get price history analysis
  const analyzePriceHistory = useCallback((history: PricingBreakdown['priceHistory']) => {
    if (history.length < 2) return null;

    const latest = history[history.length - 1];
    const previous = history[history.length - 2];
    const change = latest.price - previous.price;
    const changePercent = (change / previous.price) * 100;

    const trend = history.slice(-5).reduce((acc, curr, index, arr) => {
      if (index === 0) return 'stable';
      const prevPrice = arr[index - 1].price;
      if (curr.price > prevPrice) return acc === 'decreasing' ? 'volatile' : 'increasing';
      if (curr.price < prevPrice) return acc === 'increasing' ? 'volatile' : 'decreasing';
      return acc;
    }, 'stable' as 'increasing' | 'decreasing' | 'stable' | 'volatile');

    return {
      currentPrice: latest.price,
      change,
      changePercent,
      trend,
      isGoodTime: trend === 'decreasing' || (trend === 'stable' && change <= 0)
    };
  }, []);

  // Calculate savings with subscription
  const calculateSubscriptionSavings = useCallback((
    regularPrice: number,
    subscriptionTier: 'FREE' | 'PLUS' | 'PRO'
  ): { discount: number; annualSavings: number } => {
    const discountRates = {
      FREE: 0,
      PLUS: 0.1, // 10% discount
      PRO: 0.2   // 20% discount
    };

    const discount = regularPrice * discountRates[subscriptionTier];
    const annualSavings = discount * 12; // Assuming monthly usage

    return { discount, annualSavings };
  }, []);

  return {
    pricingBreakdown,
    priceComparison,
    isLoading,
    error,
    calculatePricing,
    compareProviderPrices,
    calculateDynamicPrice,
    formatPriceBreakdown,
    analyzePriceHistory,
    calculateSubscriptionSavings
  };
}