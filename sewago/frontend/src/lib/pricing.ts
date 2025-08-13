
import { FEATURE_FLAGS } from './feature-flags';

export interface PricingModifier {
  id: string;
  name: string;
  type: 'surge' | 'discount';
  multiplier: number;
  conditions: {
    serviceSlug?: string;
    city?: string;
    dayOfWeek?: number[];
    timeWindow?: {
      start: string;
      end: string;
    };
    demand?: 'high' | 'medium' | 'low';
  };
  active: boolean;
}

export interface PricingResult {
  basePrice: number;
  modifiers: Array<{
    name: string;
    type: 'surge' | 'discount';
    amount: number;
  }>;
  finalPrice: number;
  expressSlotSurcharge?: number;
}

const DEFAULT_MODIFIERS: PricingModifier[] = [
  {
    id: 'weekend-surge',
    name: 'Weekend Peak Hours',
    type: 'surge',
    multiplier: 1.25,
    conditions: {
      dayOfWeek: [0, 6], // Sunday, Saturday
      timeWindow: { start: '10:00', end: '18:00' }
    },
    active: true
  },
  {
    id: 'off-peak-discount',
    name: 'Off-Peak Discount',
    type: 'discount',
    multiplier: 0.9,
    conditions: {
      timeWindow: { start: '06:00', end: '09:00' }
    },
    active: true
  },
  {
    id: 'high-demand-surge',
    name: 'High Demand',
    type: 'surge',
    multiplier: 1.4,
    conditions: {
      demand: 'high'
    },
    active: true
  }
];

export class PricingEngine {
  private modifiers: PricingModifier[] = DEFAULT_MODIFIERS;

  calculatePrice(
    basePrice: number,
    serviceSlug: string,
    city: string,
    requestedTime: Date,
    isExpressSlot: boolean = false,
    demandLevel: 'high' | 'medium' | 'low' = 'medium'
  ): PricingResult {
    if (!FEATURE_FLAGS.SURGE_ENABLED) {
      return {
        basePrice,
        modifiers: [],
        finalPrice: basePrice + (isExpressSlot ? 500 : 0), // Express surcharge in paisa
        expressSlotSurcharge: isExpressSlot ? 500 : undefined
      };
    }

    const applicableModifiers = this.getApplicableModifiers(
      serviceSlug,
      city,
      requestedTime,
      demandLevel
    );

    let finalPrice = basePrice;
    const appliedModifiers = [];

    for (const modifier of applicableModifiers) {
      const amount = basePrice * (modifier.multiplier - 1);
      finalPrice += amount;
      
      appliedModifiers.push({
        name: modifier.name,
        type: modifier.type,
        amount
      });
    }

    // Add express slot surcharge
    const expressSlotSurcharge = isExpressSlot ? 500 : undefined;
    if (expressSlotSurcharge) {
      finalPrice += expressSlotSurcharge;
    }

    return {
      basePrice,
      modifiers: appliedModifiers,
      finalPrice: Math.round(finalPrice),
      expressSlotSurcharge
    };
  }

  private getApplicableModifiers(
    serviceSlug: string,
    city: string,
    requestedTime: Date,
    demandLevel: 'high' | 'medium' | 'low'
  ): PricingModifier[] {
    const dayOfWeek = requestedTime.getDay();
    const timeString = requestedTime.toTimeString().slice(0, 5); // HH:MM format

    return this.modifiers.filter(modifier => {
      if (!modifier.active) return false;

      const { conditions } = modifier;

      // Check service
      if (conditions.serviceSlug && conditions.serviceSlug !== serviceSlug) {
        return false;
      }

      // Check city
      if (conditions.city && conditions.city !== city) {
        return false;
      }

      // Check day of week
      if (conditions.dayOfWeek && !conditions.dayOfWeek.includes(dayOfWeek)) {
        return false;
      }

      // Check time window
      if (conditions.timeWindow) {
        const { start, end } = conditions.timeWindow;
        if (timeString < start || timeString > end) {
          return false;
        }
      }

      // Check demand
      if (conditions.demand && conditions.demand !== demandLevel) {
        return false;
      }

      return true;
    });
  }

  updateModifiers(newModifiers: PricingModifier[]) {
    this.modifiers = newModifiers;
  }
}

export const pricingEngine = new PricingEngine();
