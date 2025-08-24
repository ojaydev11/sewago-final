/**
 * Subscription Pricing Engine
 * Handles tier-based pricing, discounts, and benefit calculations
 */

export type SubscriptionTier = 'FREE' | 'PLUS' | 'PRO';

export interface SubscriptionBenefits {
  discountPercentage: number;
  monthlyCredits: number; // in paisa
  prioritySupport: boolean;
  premiumSupport: boolean;
  earlyAccess: boolean;
  bookingGuarantee: boolean;
  conciergeService: boolean;
  unlimitedBookings: boolean;
  serviceBundle: boolean;
}

export interface PricingResult {
  originalPrice: number;
  discountedPrice: number;
  discountAmount: number;
  discountPercentage: number;
  creditsApplied: number;
  finalPrice: number;
  savings: number;
}

export interface SubscriptionPricing {
  monthly: number;
  yearly: number;
  familyMonthly?: number;
  familyYearly?: number;
}

/**
 * Get subscription benefits for a tier
 */
export function getSubscriptionBenefits(tier: SubscriptionTier): SubscriptionBenefits {
  switch (tier) {
    case 'FREE':
      return {
        discountPercentage: 0,
        monthlyCredits: 0,
        prioritySupport: false,
        premiumSupport: false,
        earlyAccess: false,
        bookingGuarantee: false,
        conciergeService: false,
        unlimitedBookings: false,
        serviceBundle: false,
      };
    
    case 'PLUS':
      return {
        discountPercentage: 15,
        monthlyCredits: 10000, // NPR 100
        prioritySupport: true,
        premiumSupport: false,
        earlyAccess: false,
        bookingGuarantee: false,
        conciergeService: false,
        unlimitedBookings: false,
        serviceBundle: false,
      };
    
    case 'PRO':
      return {
        discountPercentage: 25,
        monthlyCredits: 25000, // NPR 250
        prioritySupport: true,
        premiumSupport: true,
        earlyAccess: true,
        bookingGuarantee: true,
        conciergeService: true,
        unlimitedBookings: true,
        serviceBundle: true,
      };
    
    default:
      return getSubscriptionBenefits('FREE');
  }
}

/**
 * Get subscription pricing for all tiers
 */
export function getSubscriptionPricing(): Record<SubscriptionTier, SubscriptionPricing> {
  return {
    FREE: {
      monthly: 0,
      yearly: 0,
    },
    PLUS: {
      monthly: 29900, // NPR 299
      yearly: 299000, // NPR 2990 (save 10%)
      familyMonthly: 49900, // NPR 499 for up to 4 members
      familyYearly: 499000, // NPR 4990
    },
    PRO: {
      monthly: 59900, // NPR 599
      yearly: 599000, // NPR 5990 (save 10%)
      familyMonthly: 89900, // NPR 899 for up to 6 members
      familyYearly: 899000, // NPR 8990
    },
  };
}

/**
 * Calculate tier-based pricing for a service
 */
export function calculateServicePrice(
  originalPrice: number,
  tier: SubscriptionTier,
  availableCredits: number = 0,
  useCredits: boolean = true
): PricingResult {
  const benefits = getSubscriptionBenefits(tier);
  
  // Apply tier discount
  const discountAmount = Math.round(originalPrice * (benefits.discountPercentage / 100));
  const discountedPrice = originalPrice - discountAmount;
  
  // Apply service credits if available and requested
  let creditsApplied = 0;
  if (useCredits && availableCredits > 0) {
    creditsApplied = Math.min(availableCredits, discountedPrice);
  }
  
  const finalPrice = discountedPrice - creditsApplied;
  const totalSavings = discountAmount + creditsApplied;
  
  return {
    originalPrice,
    discountedPrice,
    discountAmount,
    discountPercentage: benefits.discountPercentage,
    creditsApplied,
    finalPrice: Math.max(0, finalPrice),
    savings: totalSavings,
  };
}

/**
 * Calculate bundled service pricing with additional discounts
 */
export function calculateBundlePrice(
  services: Array<{ id: string; price: number; category: string }>,
  tier: SubscriptionTier,
  availableCredits: number = 0
): PricingResult & { bundleDiscount: number } {
  const benefits = getSubscriptionBenefits(tier);
  const totalOriginalPrice = services.reduce((sum, service) => sum + service.price, 0);
  
  // Base tier pricing
  const basePricing = calculateServicePrice(totalOriginalPrice, tier, 0, false);
  
  // Additional bundle discount for PRO tier
  let bundleDiscount = 0;
  if (benefits.serviceBundle && services.length >= 2) {
    const bundleDiscountPercentage = Math.min(10, services.length * 2); // Up to 10% additional
    bundleDiscount = Math.round(basePricing.discountedPrice * (bundleDiscountPercentage / 100));
  }
  
  const priceAfterBundle = basePricing.discountedPrice - bundleDiscount;
  
  // Apply credits
  const creditsApplied = Math.min(availableCredits, priceAfterBundle);
  const finalPrice = priceAfterBundle - creditsApplied;
  
  return {
    originalPrice: totalOriginalPrice,
    discountedPrice: basePricing.discountedPrice,
    discountAmount: basePricing.discountAmount,
    discountPercentage: benefits.discountPercentage,
    bundleDiscount,
    creditsApplied,
    finalPrice: Math.max(0, finalPrice),
    savings: basePricing.discountAmount + bundleDiscount + creditsApplied,
  };
}

/**
 * Calculate potential savings for upgrade suggestions
 */
export function calculateUpgradeSavings(
  currentTier: SubscriptionTier,
  targetTier: SubscriptionTier,
  monthlySpending: number
): {
  monthlySavings: number;
  yearlyProjection: number;
  breakEvenPoint: number; // months
  roi: number; // percentage
} {
  const currentBenefits = getSubscriptionBenefits(currentTier);
  const targetBenefits = getSubscriptionBenefits(targetTier);
  const pricing = getSubscriptionPricing();
  
  const currentSavings = monthlySpending * (currentBenefits.discountPercentage / 100);
  const targetSavings = monthlySpending * (targetBenefits.discountPercentage / 100);
  const additionalSavings = targetSavings - currentSavings;
  
  const upgradeCost = pricing[targetTier].monthly - pricing[currentTier].monthly;
  const netMonthlySavings = additionalSavings - upgradeCost;
  
  const breakEvenMonths = upgradeCost > 0 ? upgradeCost / Math.max(additionalSavings, 1) : 0;
  const yearlyProjection = netMonthlySavings * 12;
  const roi = upgradeCost > 0 ? (additionalSavings * 12 / upgradeCost) * 100 : 0;
  
  return {
    monthlySavings: Math.round(netMonthlySavings),
    yearlyProjection: Math.round(yearlyProjection),
    breakEvenPoint: Math.ceil(breakEvenMonths),
    roi: Math.round(roi),
  };
}

/**
 * Check if user should be shown upgrade suggestions
 */
export function shouldShowUpgradeSuggestion(
  currentTier: SubscriptionTier,
  monthlyBookings: number,
  monthlySpending: number,
  supportTickets: number
): {
  shouldShow: boolean;
  reason: string;
  suggestedTier: SubscriptionTier;
  estimatedSavings: number;
} {
  if (currentTier === 'PRO') {
    return {
      shouldShow: false,
      reason: 'Already on highest tier',
      suggestedTier: 'PRO',
      estimatedSavings: 0,
    };
  }
  
  const pricing = getSubscriptionPricing();
  
  // High usage patterns
  if (currentTier === 'FREE') {
    if (monthlyBookings >= 3 || monthlySpending >= 200000) { // NPR 2000+
      const savings = calculateUpgradeSavings('FREE', 'PLUS', monthlySpending);
      if (savings.monthlySavings > 0) {
        return {
          shouldShow: true,
          reason: 'High booking frequency would benefit from Plus discount',
          suggestedTier: 'PLUS',
          estimatedSavings: savings.monthlySavings,
        };
      }
    }
    
    if (supportTickets >= 2) {
      return {
        shouldShow: true,
        reason: 'Frequent support needs would benefit from priority support',
        suggestedTier: 'PLUS',
        estimatedSavings: 0,
      };
    }
  }
  
  if (currentTier === 'PLUS') {
    if (monthlyBookings >= 5 || monthlySpending >= 400000) { // NPR 4000+
      const savings = calculateUpgradeSavings('PLUS', 'PRO', monthlySpending);
      if (savings.monthlySavings > 0) {
        return {
          shouldShow: true,
          reason: 'High spending would benefit from Pro\'s higher discount',
          suggestedTier: 'PRO',
          estimatedSavings: savings.monthlySavings,
        };
      }
    }
    
    if (supportTickets >= 3) {
      return {
        shouldShow: true,
        reason: 'Frequent support needs would benefit from 24/7 premium support',
        suggestedTier: 'PRO',
        estimatedSavings: 0,
      };
    }
  }
  
  return {
    shouldShow: false,
    reason: 'Current usage doesn\'t justify upgrade',
    suggestedTier: currentTier,
    estimatedSavings: 0,
  };
}

/**
 * Calculate family plan value proposition
 */
export function calculateFamilyPlanValue(
  tier: SubscriptionTier,
  memberCount: number
): {
  individualCost: number;
  familyCost: number;
  savings: number;
  savingsPercentage: number;
  maxMembers: number;
} {
  const pricing = getSubscriptionPricing();
  const tierPricing = pricing[tier];
  
  if (!tierPricing.familyMonthly) {
    return {
      individualCost: 0,
      familyCost: 0,
      savings: 0,
      savingsPercentage: 0,
      maxMembers: 0,
    };
  }
  
  const maxMembers = tier === 'PLUS' ? 4 : 6;
  const actualMembers = Math.min(memberCount, maxMembers);
  
  const individualCost = tierPricing.monthly * actualMembers;
  const familyCost = tierPricing.familyMonthly;
  const savings = individualCost - familyCost;
  const savingsPercentage = individualCost > 0 ? (savings / individualCost) * 100 : 0;
  
  return {
    individualCost,
    familyCost,
    savings,
    savingsPercentage: Math.round(savingsPercentage),
    maxMembers,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `NPR ${Math.round(amount / 100)}`;
}

/**
 * Format discount percentage
 */
export function formatDiscount(percentage: number): string {
  return `${percentage}% off`;
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  switch (tier) {
    case 'FREE':
      return 'SewaGo Free';
    case 'PLUS':
      return 'SewaGo Plus';
    case 'PRO':
      return 'SewaGo Pro';
    default:
      return 'Unknown';
  }
}

/**
 * Check if tier has specific benefit
 */
export function hasBenefit(tier: SubscriptionTier, benefit: keyof SubscriptionBenefits): boolean {
  const benefits = getSubscriptionBenefits(tier);
  return Boolean(benefits[benefit]);
}

/**
 * Calculate service credits usage and remaining balance
 */
export function calculateCreditsUsage(
  tier: SubscriptionTier,
  usedCredits: number,
  monthStart: Date = new Date()
): {
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  utilizationPercentage: number;
  daysUntilRefresh: number;
} {
  const benefits = getSubscriptionBenefits(tier);
  const totalCredits = benefits.monthlyCredits;
  const remainingCredits = Math.max(0, totalCredits - usedCredits);
  const utilizationPercentage = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0;
  
  // Calculate days until next month
  const now = new Date();
  const nextMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
  const daysUntilRefresh = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    totalCredits,
    usedCredits,
    remainingCredits,
    utilizationPercentage: Math.round(utilizationPercentage),
    daysUntilRefresh: Math.max(0, daysUntilRefresh),
  };
}