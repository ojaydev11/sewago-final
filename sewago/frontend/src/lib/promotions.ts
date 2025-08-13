
import { FEATURE_FLAGS } from './feature-flags';

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'first_booking' | 'winback';
  value: number; // percentage (0-100) or fixed amount in paisa
  conditions: {
    minOrderValue?: number;
    maxDiscount?: number;
    serviceCategories?: string[];
    cities?: string[];
    newUsersOnly?: boolean;
    existingUsersOnly?: boolean;
  };
  usage: {
    totalLimit: number;
    perUserLimit: number;
    currentUsage: number;
  };
  validFrom: Date;
  validUntil: Date;
  active: boolean;
  stackable: boolean;
}

export interface PromoApplication {
  promotionId: string;
  code: string;
  discountAmount: number;
  applied: boolean;
  reason?: string;
}

const DEFAULT_PROMOTIONS: Promotion[] = [
  {
    id: 'first-booking-20',
    code: 'WELCOME20',
    name: 'First Booking Discount',
    description: 'Get 20% off your first booking',
    type: 'first_booking',
    value: 20,
    conditions: {
      maxDiscount: 500, // 5 NPR max
      newUsersOnly: true
    },
    usage: {
      totalLimit: 1000,
      perUserLimit: 1,
      currentUsage: 0
    },
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    active: true,
    stackable: false
  },
  {
    id: 'winback-15',
    code: 'COMEBACK15',
    name: 'Win-back Campaign',
    description: 'Come back and save 15%',
    type: 'winback',
    value: 15,
    conditions: {
      maxDiscount: 300,
      existingUsersOnly: true
    },
    usage: {
      totalLimit: 500,
      perUserLimit: 2,
      currentUsage: 0
    },
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    active: true,
    stackable: true
  }
];

export class PromotionEngine {
  private promotions: Promotion[] = DEFAULT_PROMOTIONS;
  private userRedemptions: Map<string, Map<string, number>> = new Map();

  async validatePromoCode(
    code: string,
    userId: string,
    orderValue: number,
    serviceCategory: string,
    city: string,
    isFirstBooking: boolean
  ): Promise<PromoApplication> {
    if (!FEATURE_FLAGS.PROMOS_ENABLED) {
      return {
        promotionId: '',
        code,
        discountAmount: 0,
        applied: false,
        reason: 'Promotions are currently disabled'
      };
    }

    const promotion = this.promotions.find(p => 
      p.code.toLowerCase() === code.toLowerCase() && 
      p.active &&
      new Date() >= p.validFrom &&
      new Date() <= p.validUntil
    );

    if (!promotion) {
      return {
        promotionId: '',
        code,
        discountAmount: 0,
        applied: false,
        reason: 'Invalid or expired promo code'
      };
    }

    // Check usage limits
    const userUsage = this.getUserUsage(userId, promotion.id);
    if (userUsage >= promotion.usage.perUserLimit) {
      return {
        promotionId: promotion.id,
        code,
        discountAmount: 0,
        applied: false,
        reason: 'Promo code usage limit reached'
      };
    }

    if (promotion.usage.currentUsage >= promotion.usage.totalLimit) {
      return {
        promotionId: promotion.id,
        code,
        discountAmount: 0,
        applied: false,
        reason: 'Promo code no longer available'
      };
    }

    // Check conditions
    if (!this.checkConditions(promotion, orderValue, serviceCategory, city, isFirstBooking)) {
      return {
        promotionId: promotion.id,
        code,
        discountAmount: 0,
        applied: false,
        reason: 'Promo code conditions not met'
      };
    }

    // Calculate discount
    const discountAmount = this.calculateDiscount(promotion, orderValue);

    return {
      promotionId: promotion.id,
      code,
      discountAmount,
      applied: true
    };
  }

  private checkConditions(
    promotion: Promotion,
    orderValue: number,
    serviceCategory: string,
    city: string,
    isFirstBooking: boolean
  ): boolean {
    const { conditions } = promotion;

    if (conditions.minOrderValue && orderValue < conditions.minOrderValue) {
      return false;
    }

    if (conditions.serviceCategories && !conditions.serviceCategories.includes(serviceCategory)) {
      return false;
    }

    if (conditions.cities && !conditions.cities.includes(city)) {
      return false;
    }

    if (conditions.newUsersOnly && !isFirstBooking) {
      return false;
    }

    return true;
  }

  private calculateDiscount(promotion: Promotion, orderValue: number): number {
    let discount = 0;

    if (promotion.type === 'percentage' || promotion.type === 'first_booking' || promotion.type === 'winback') {
      discount = Math.round((orderValue * promotion.value) / 100);
    } else if (promotion.type === 'fixed') {
      discount = promotion.value;
    }

    // Apply max discount limit
    if (promotion.conditions.maxDiscount) {
      discount = Math.min(discount, promotion.conditions.maxDiscount);
    }

    return discount;
  }

  private getUserUsage(userId: string, promotionId: string): number {
    const userRedemptions = this.userRedemptions.get(userId);
    if (!userRedemptions) return 0;
    return userRedemptions.get(promotionId) || 0;
  }

  recordRedemption(userId: string, promotionId: string) {
    if (!this.userRedemptions.has(userId)) {
      this.userRedemptions.set(userId, new Map());
    }
    
    const userRedemptions = this.userRedemptions.get(userId)!;
    const currentUsage = userRedemptions.get(promotionId) || 0;
    userRedemptions.set(promotionId, currentUsage + 1);

    // Update total usage
    const promotion = this.promotions.find(p => p.id === promotionId);
    if (promotion) {
      promotion.usage.currentUsage += 1;
    }
  }
}

export const promotionEngine = new PromotionEngine();
