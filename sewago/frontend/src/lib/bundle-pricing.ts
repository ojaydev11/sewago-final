/**
 * Service Bundle Pricing Engine
 * Handles dynamic pricing for service bundles with volume discounts and package deals
 */

export interface BundleItem {
  serviceId: string;
  serviceName: string;
  basePrice: number;
  quantity: number;
  unit: string;
  category: string;
}

export interface BundleDiscount {
  type: 'percentage' | 'fixed' | 'volume';
  value: number;
  minQuantity?: number;
  maxQuantity?: number;
  description: string;
}

export interface ServiceBundle {
  id: string;
  name: string;
  description: string;
  items: BundleItem[];
  basePrice: number;
  discountedPrice: number;
  savings: number;
  savingsPercentage: number;
  discounts: BundleDiscount[];
  isPopular?: boolean;
  isLimited?: boolean;
  validityDays: number;
  maxBookings: number;
  currentBookings: number;
  category: string;
  tags: string[];
  imageUrl?: string;
}

export interface BundlePricingRule {
  id: string;
  bundleId: string;
  ruleType: 'volume' | 'seasonal' | 'loyalty' | 'referral' | 'firstTime';
  conditions: {
    minAmount?: number;
    maxAmount?: number;
    minQuantity?: number;
    maxQuantity?: number;
    customerType?: 'new' | 'returning' | 'vip';
    validFrom?: Date;
    validTo?: Date;
  };
  discount: BundleDiscount;
  priority: number;
  isActive: boolean;
}

/**
 * Calculate bundle pricing with all applicable discounts
 */
export function calculateBundlePricing(
  bundle: ServiceBundle,
  customerType: 'new' | 'returning' | 'vip' = 'returning',
  referralCode?: string,
  seasonalMultiplier: number = 1.0
): ServiceBundle {
  let finalPrice = bundle.basePrice;
  const appliedDiscounts: BundleDiscount[] = [];
  
  // Apply seasonal pricing
  if (seasonalMultiplier !== 1.0) {
    finalPrice *= seasonalMultiplier;
  }
  
  // Apply bundle-specific discounts
  bundle.discounts.forEach(discount => {
    if (discount.type === 'percentage') {
      const discountAmount = (finalPrice * discount.value) / 100;
      finalPrice -= discountAmount;
      appliedDiscounts.push(discount);
    } else if (discount.type === 'fixed') {
      finalPrice -= discount.value;
      appliedDiscounts.push(discount);
    } else if (discount.type === 'volume') {
      // Volume discounts are already calculated in base price
      appliedDiscounts.push(discount);
    }
  });
  
  // Apply customer type discounts
  if (customerType === 'new') {
    const newCustomerDiscount = 0.10; // 10% for new customers
    const discountAmount = (finalPrice * newCustomerDiscount);
    finalPrice -= discountAmount;
    appliedDiscounts.push({
      type: 'percentage',
      value: 10,
      description: 'New Customer Discount'
    });
  } else if (customerType === 'vip') {
    const vipDiscount = 0.15; // 15% for VIP customers
    const discountAmount = (finalPrice * vipDiscount);
    finalPrice -= discountAmount;
    appliedDiscounts.push({
      type: 'percentage',
      value: 15,
      description: 'VIP Customer Discount'
    });
  }
  
  // Apply referral discount
  if (referralCode) {
    const referralDiscount = 0.05; // 5% referral discount
    const discountAmount = (finalPrice * referralDiscount);
    finalPrice -= discountAmount;
    appliedDiscounts.push({
      type: 'percentage',
      value: 5,
      description: 'Referral Discount'
    });
  }
  
  // Ensure minimum price
  finalPrice = Math.max(finalPrice, bundle.basePrice * 0.5);
  
  const savings = bundle.basePrice - finalPrice;
  const savingsPercentage = (savings / bundle.basePrice) * 100;
  
  return {
    ...bundle,
    discountedPrice: Math.round(finalPrice),
    savings: Math.round(savings),
    savingsPercentage: Math.round(savingsPercentage * 100) / 100,
    discounts: appliedDiscounts
  };
}

/**
 * Get available service bundles
 */
export function getServiceBundles(): ServiceBundle[] {
  return [
    {
      id: 'spring-cleaning-bundle',
      name: 'Spring Cleaning Bundle',
      description: 'Complete home cleaning package including deep cleaning, window washing, and organization',
      items: [
        { serviceId: 'house-cleaning', serviceName: 'House Cleaning', basePrice: 1500, quantity: 1, unit: 'session', category: 'cleaning' },
        { serviceId: 'window-cleaning', serviceName: 'Window Cleaning', basePrice: 800, quantity: 1, unit: 'session', category: 'cleaning' },
        { serviceId: 'organization', serviceName: 'Home Organization', basePrice: 1200, quantity: 1, unit: 'session', category: 'cleaning' }
      ],
      basePrice: 3500,
      discountedPrice: 2800,
      savings: 700,
      savingsPercentage: 20,
      discounts: [
        { type: 'percentage', value: 20, description: 'Bundle Discount' }
      ],
      isPopular: true,
      validityDays: 30,
      maxBookings: 50,
      currentBookings: 23,
      category: 'cleaning',
      tags: ['cleaning', 'spring', 'bundle', 'popular'],
      imageUrl: '/icons/cleaning.svg'
    },
    {
      id: 'electrical-maintenance-bundle',
      name: 'Electrical Maintenance Bundle',
      description: 'Comprehensive electrical safety check and maintenance package',
      items: [
        { serviceId: 'electrical-inspection', serviceName: 'Electrical Inspection', basePrice: 2000, quantity: 1, unit: 'session', category: 'electrical' },
        { serviceId: 'wiring-repair', serviceName: 'Wiring Repair', basePrice: 1500, quantity: 1, unit: 'session', category: 'electrical' },
        { serviceId: 'safety-upgrade', serviceName: 'Safety Upgrades', basePrice: 2500, quantity: 1, unit: 'session', category: 'electrical' }
      ],
      basePrice: 6000,
      discountedPrice: 4800,
      savings: 1200,
      savingsPercentage: 20,
      discounts: [
        { type: 'percentage', value: 20, description: 'Bundle Discount' }
      ],
      isLimited: true,
      validityDays: 15,
      maxBookings: 25,
      currentBookings: 18,
      category: 'electrical',
      tags: ['electrical', 'maintenance', 'safety', 'limited'],
      imageUrl: '/icons/electrical.svg'
    },
    {
      id: 'home-improvement-bundle',
      name: 'Home Improvement Bundle',
      description: 'Multi-service package for home renovation and improvement projects',
      items: [
        { serviceId: 'painting', serviceName: 'Interior Painting', basePrice: 3000, quantity: 1, unit: 'room', category: 'renovation' },
        { serviceId: 'carpentry', serviceName: 'Carpentry Work', basePrice: 2500, quantity: 1, unit: 'project', category: 'renovation' },
        { serviceId: 'plumbing', serviceName: 'Plumbing Repair', basePrice: 1800, quantity: 1, unit: 'session', category: 'plumbing' }
      ],
      basePrice: 7300,
      discountedPrice: 5840,
      savings: 1460,
      savingsPercentage: 20,
      discounts: [
        { type: 'percentage', value: 20, description: 'Bundle Discount' }
      ],
      validityDays: 45,
      maxBookings: 30,
      currentBookings: 12,
      category: 'renovation',
      tags: ['renovation', 'improvement', 'multi-service'],
      imageUrl: '/icons/gardening.svg'
    },
    {
      id: 'office-maintenance-bundle',
      name: 'Office Maintenance Bundle',
      description: 'Professional office cleaning and maintenance services',
      items: [
        { serviceId: 'office-cleaning', serviceName: 'Office Cleaning', basePrice: 2000, quantity: 1, unit: 'session', category: 'commercial' },
        { serviceId: 'carpet-cleaning', serviceName: 'Carpet Cleaning', basePrice: 1500, quantity: 1, unit: 'session', category: 'commercial' },
        { serviceId: 'sanitization', serviceName: 'Sanitization', basePrice: 1200, quantity: 1, unit: 'session', category: 'commercial' }
      ],
      basePrice: 4700,
      discountedPrice: 3760,
      savings: 940,
      savingsPercentage: 20,
      discounts: [
        { type: 'percentage', value: 20, description: 'Bundle Discount' }
      ],
      validityDays: 60,
      maxBookings: 40,
      currentBookings: 28,
      category: 'commercial',
      tags: ['commercial', 'office', 'maintenance'],
      imageUrl: '/icons/cleaning.svg'
    }
  ];
}

/**
 * Get bundle by ID
 */
export function getBundleById(bundleId: string): ServiceBundle | undefined {
  return getServiceBundles().find(bundle => bundle.id === bundleId);
}

/**
 * Get bundles by category
 */
export function getBundlesByCategory(category: string): ServiceBundle[] {
  return getServiceBundles().filter(bundle => bundle.category === category);
}

/**
 * Get popular bundles
 */
export function getPopularBundles(): ServiceBundle[] {
  return getServiceBundles().filter(bundle => bundle.isPopular);
}

/**
 * Get limited time bundles
 */
export function getLimitedBundles(): ServiceBundle[] {
  return getServiceBundles().filter(bundle => bundle.isLimited);
}

/**
 * Calculate bundle availability
 */
export function getBundleAvailability(bundle: ServiceBundle): {
  isAvailable: boolean;
  remainingBookings: number;
  availabilityPercentage: number;
  expiresIn: number;
} {
  const remainingBookings = bundle.maxBookings - bundle.currentBookings;
  const availabilityPercentage = (remainingBookings / bundle.maxBookings) * 100;
  const isAvailable = remainingBookings > 0;
  
  // Calculate days until expiry (mock implementation)
  const expiresIn = Math.floor(Math.random() * bundle.validityDays) + 1;
  
  return {
    isAvailable,
    remainingBookings,
    availabilityPercentage: Math.round(availabilityPercentage),
    expiresIn
  };
}

/**
 * Get bundle recommendations based on customer preferences
 */
export function getBundleRecommendations(
  customerHistory: string[],
  preferredCategories: string[],
  budget: number
): ServiceBundle[] {
  const allBundles = getServiceBundles();
  
  return allBundles
    .filter(bundle => 
      bundle.discountedPrice <= budget &&
      (preferredCategories.includes(bundle.category) || 
       customerHistory.includes(bundle.category))
    )
    .sort((a, b) => {
      // Sort by relevance score
      const aScore = calculateRelevanceScore(a, customerHistory, preferredCategories);
      const bScore = calculateRelevanceScore(b, customerHistory, preferredCategories);
      return bScore - aScore;
    })
    .slice(0, 3);
}

/**
 * Calculate relevance score for bundle recommendations
 */
function calculateRelevanceScore(
  bundle: ServiceBundle,
  customerHistory: string[],
  preferredCategories: string[]
): number {
  let score = 0;
  
  // Category preference bonus
  if (preferredCategories.includes(bundle.category)) {
    score += 10;
  }
  
  // History relevance bonus
  if (customerHistory.includes(bundle.category)) {
    score += 5;
  }
  
  // Popularity bonus
  if (bundle.isPopular) {
    score += 3;
  }
  
  // Limited time urgency bonus
  if (bundle.isLimited) {
    score += 2;
  }
  
  // Savings bonus
  score += Math.min(bundle.savingsPercentage / 2, 5);
  
  return score;
}
