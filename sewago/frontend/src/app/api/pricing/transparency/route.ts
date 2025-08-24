import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface PricingFactors {
  demand: 'LOW' | 'MEDIUM' | 'HIGH';
  timeOfDay: 'PEAK' | 'NORMAL' | 'OFF_PEAK';
  distance: number;
  urgency: 'STANDARD' | 'URGENT' | 'EMERGENCY';
  weatherConditions?: string;
  seasonalFactor?: number;
}

// POST /api/pricing/transparency - Calculate transparent pricing breakdown
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, location, factors = {} as PricingFactors } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const basePrice = service.basePrice; // in paisa (NPR cents)
    let finalPrice = basePrice;
    const calculation: Array<{ step: string; amount: number; description: string }> = [];
    
    calculation.push({
      step: 'Base Price',
      amount: basePrice,
      description: `Base price for ${service.name}`
    });

    // Apply demand-based pricing
    let demandMultiplier = 1;
    switch (factors.demand) {
      case 'HIGH':
        demandMultiplier = 1.2;
        break;
      case 'LOW':
        demandMultiplier = 0.9;
        break;
      default:
        demandMultiplier = 1;
    }
    
    if (demandMultiplier !== 1) {
      const demandAdjustment = Math.round(basePrice * (demandMultiplier - 1));
      finalPrice += demandAdjustment;
      calculation.push({
        step: `${factors.demand} Demand Adjustment`,
        amount: demandAdjustment,
        description: `${demandMultiplier > 1 ? 'Increased' : 'Reduced'} pricing due to ${factors.demand?.toLowerCase()} demand`
      });
    }

    // Apply time-based pricing
    let timeMultiplier = 1;
    switch (factors.timeOfDay) {
      case 'PEAK':
        timeMultiplier = 1.15;
        break;
      case 'OFF_PEAK':
        timeMultiplier = 0.95;
        break;
      default:
        timeMultiplier = 1;
    }

    if (timeMultiplier !== 1) {
      const timeAdjustment = Math.round(basePrice * (timeMultiplier - 1));
      finalPrice += timeAdjustment;
      calculation.push({
        step: `${factors.timeOfDay} Hours Adjustment`,
        amount: timeAdjustment,
        description: `${timeMultiplier > 1 ? 'Peak hour' : 'Off-peak'} pricing adjustment`
      });
    }

    // Apply urgency pricing
    let urgencyMultiplier = 1;
    switch (factors.urgency) {
      case 'URGENT':
        urgencyMultiplier = 1.3;
        break;
      case 'EMERGENCY':
        urgencyMultiplier = 1.5;
        break;
      default:
        urgencyMultiplier = 1;
    }

    if (urgencyMultiplier !== 1) {
      const urgencyAdjustment = Math.round(basePrice * (urgencyMultiplier - 1));
      finalPrice += urgencyAdjustment;
      calculation.push({
        step: `${factors.urgency} Service Premium`,
        amount: urgencyAdjustment,
        description: `Premium for ${factors.urgency?.toLowerCase()} service delivery`
      });
    }

    // Apply distance-based pricing
    if (factors.distance && factors.distance > 5) {
      const distanceCharge = (factors.distance - 5) * 50 * 100; // NPR 50 per km in paisa
      finalPrice += distanceCharge;
      calculation.push({
        step: 'Distance Charge',
        amount: distanceCharge,
        description: `Additional charge for ${factors.distance}km distance (beyond 5km base)`
      });
    }

    // Apply weather conditions
    if (factors.weatherConditions && ['rain', 'storm', 'extreme'].includes(factors.weatherConditions)) {
      const weatherCharge = Math.round(basePrice * 0.1);
      finalPrice += weatherCharge;
      calculation.push({
        step: 'Weather Surcharge',
        amount: weatherCharge,
        description: `Additional charge due to ${factors.weatherConditions} weather conditions`
      });
    }

    // Apply seasonal factors
    if (factors.seasonalFactor && factors.seasonalFactor !== 0) {
      const seasonalAdjustment = Math.round(basePrice * factors.seasonalFactor);
      finalPrice += seasonalAdjustment;
      calculation.push({
        step: 'Seasonal Adjustment',
        amount: seasonalAdjustment,
        description: seasonalAdjustment > 0 ? 'Festival season pricing increase' : 'Off-season discount'
      });
    }

    // Calculate taxes and fees
    const taxes = {
      'VAT (13%)': Math.round(finalPrice * 0.13),
      'Service Tax': Math.round(finalPrice * 0.02)
    };

    const fees = {
      'Platform Fee': Math.round(finalPrice * 0.05),
      'Payment Processing': 500 // NPR 5 in paisa
    };

    const discounts = {
      // Add any applicable discounts
    };

    // Calculate totals
    const taxTotal = Object.values(taxes).reduce((sum, tax) => sum + tax, 0);
    const feeTotal = Object.values(fees).reduce((sum, fee) => sum + fee, 0);
    const discountTotal = Object.values(discounts).reduce((sum, discount) => sum + discount, 0);
    
    const totalBeforeDiscounts = finalPrice + taxTotal + feeTotal;
    const grandTotal = totalBeforeDiscounts - discountTotal;

    // Add final calculations
    calculation.push(
      ...Object.entries(taxes).map(([name, amount]) => ({
        step: name,
        amount,
        description: `${name} applied to service amount`
      })),
      ...Object.entries(fees).map(([name, amount]) => ({
        step: name,
        amount,
        description: `${name} for platform services`
      })),
      ...Object.entries(discounts).map(([name, amount]) => ({
        step: name,
        amount: -amount,
        description: `Discount: ${name}`
      }))
    );

    // Generate price history (mock data for demo)
    const priceHistory = generatePriceHistory(grandTotal);

    // Calculate provider cut and platform fee
    const providerCut = Math.round(finalPrice * 0.85); // 85% to provider
    const platformFee = Math.round(finalPrice * 0.15); // 15% platform commission

    const pricingBreakdown = {
      basePrice,
      taxes,
      fees,
      discounts,
      subscriptionDiscount: 0, // Would be calculated based on user's subscription
      finalPrice: grandTotal,
      currency: 'NPR',
      calculation,
      priceHistory,
      providerCut,
      platformFee,
      generatedAt: new Date().toISOString()
    };

    // Log pricing calculation
    await prisma.transparencyLog.create({
      data: {
        entityType: 'pricing',
        entityId: serviceId,
        action: 'PRICE_UPDATE',
        data: {
          serviceId,
          location,
          factors,
          basePrice,
          finalPrice: grandTotal,
          calculations: calculation.length
        }
      }
    });

    return NextResponse.json(pricingBreakdown);
  } catch (error) {
    console.error('Error calculating transparent pricing:', error);
    return NextResponse.json(
      { error: 'Failed to calculate pricing' },
      { status: 500 }
    );
  }
}

function generatePriceHistory(currentPrice: number) {
  const history = [];
  const today = new Date();
  
  // Generate 7 days of price history
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Add some realistic price variation
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const price = Math.round(currentPrice * (1 + variation));
    
    history.push({
      date: date.toISOString().split('T')[0],
      price,
      reason: i === 0 ? 'Current price' : i === 1 ? 'Previous day' : 'Historical price'
    });
  }
  
  return history;
}