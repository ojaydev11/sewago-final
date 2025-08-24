import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/pricing/comparison - Compare prices across providers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const maxDistance = parseFloat(searchParams.get('maxDistance') || '50');
    const availableOnly = searchParams.get('availableOnly') === 'true';

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

    // Find providers who offer this service category
    const providers = await prisma.provider.findMany({
      where: {
        verified: true,
        ...(availableOnly && {
          providerStatus: {
            isAvailable: true
          }
        }),
        // Simplified category matching - in production, you'd have proper service-provider mapping
        skills: {
          hasSome: [service.category]
        }
      },
      include: {
        providerStatus: true,
        realTimeMetrics: {
          where: {
            timeWindow: '24h'
          }
        },
        bookings: {
          where: {
            status: 'COMPLETED'
          },
          include: {
            review: true
          },
          take: 100 // For calculating metrics
        }
      }
    });

    // Calculate metrics and pricing for each provider
    const providerComparisons = await Promise.all(
      providers.map(async (provider) => {
        // Calculate average rating
        const completedBookings = provider.bookings.filter(b => b.review);
        const averageRating = completedBookings.length > 0
          ? completedBookings.reduce((sum, booking) => sum + (booking.review?.rating || 0), 0) / completedBookings.length
          : 0;

        // Filter by minimum rating
        if (averageRating < minRating) {
          return null;
        }

        // Calculate distance (simplified - in production use proper geolocation)
        const providerDistance = calculateDistance(
          lat, lng,
          provider.currentLat || 27.7172,
          provider.currentLng || 85.3240
        );

        if (providerDistance > maxDistance) {
          return null;
        }

        // Calculate completion rate
        const totalBookings = provider.bookings.length;
        const completedCount = provider.bookings.filter(b => b.status === 'COMPLETED').length;
        const completionRate = totalBookings > 0 ? (completedCount / totalBookings) * 100 : 100;

        // Get response time from metrics
        const responseTimeMetric = provider.realTimeMetrics.find(m => m.metric === 'response_time');
        const responseTime = responseTimeMetric ? `${Math.round(responseTimeMetric.value)}min` : '~15min';

        // Calculate dynamic pricing for this provider
        const basePrice = service.basePrice;
        const providerPricing = calculateProviderPricing(provider, basePrice, {
          distance: providerDistance,
          demand: 'MEDIUM',
          timeOfDay: getCurrentTimeOfDay(),
          urgency: 'STANDARD'
        });

        return {
          providerId: provider.id,
          providerName: provider.name,
          basePrice,
          finalPrice: providerPricing.finalPrice,
          rating: averageRating,
          responseTime,
          completionRate,
          distance: providerDistance,
          isAvailable: provider.providerStatus?.isAvailable || false,
          tier: provider.tier,
          yearsActive: provider.yearsActive,
          totalBookings,
          pricing: providerPricing
        };
      })
    );

    // Filter out null results and sort by price
    const validComparisons = providerComparisons
      .filter(Boolean)
      .sort((a, b) => a!.finalPrice - b!.finalPrice);

    return NextResponse.json(validComparisons);
  } catch (error) {
    console.error('Error fetching price comparison:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price comparison' },
      { status: 500 }
    );
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getCurrentTimeOfDay(): 'PEAK' | 'NORMAL' | 'OFF_PEAK' {
  const hour = new Date().getHours();
  
  if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    return 'PEAK';
  } else if (hour >= 22 || hour <= 6) {
    return 'OFF_PEAK';
  } else {
    return 'NORMAL';
  }
}

function calculateProviderPricing(provider: any, basePrice: number, factors: any) {
  let finalPrice = basePrice;
  const adjustments: Array<{ factor: string; adjustment: number; reason: string }> = [];

  // Provider tier adjustment
  const tierMultipliers = {
    'PROVISIONAL': 0.9,
    'CERTIFIED': 1.0,
    'PREMIUM': 1.15,
    'ELITE': 1.3
  };

  const tierMultiplier = tierMultipliers[provider.tier as keyof typeof tierMultipliers] || 1.0;
  if (tierMultiplier !== 1.0) {
    const tierAdjustment = Math.round(basePrice * (tierMultiplier - 1));
    finalPrice += tierAdjustment;
    adjustments.push({
      factor: `${provider.tier} Tier`,
      adjustment: tierAdjustment,
      reason: `${provider.tier} tier provider pricing`
    });
  }

  // Experience adjustment
  if (provider.yearsActive >= 5) {
    const experienceBonus = Math.round(basePrice * 0.1);
    finalPrice += experienceBonus;
    adjustments.push({
      factor: 'Experience Bonus',
      adjustment: experienceBonus,
      reason: `${provider.yearsActive} years of experience`
    });
  }

  // Distance-based pricing
  if (factors.distance > 5) {
    const distanceCharge = (factors.distance - 5) * 50 * 100; // NPR 50 per km in paisa
    finalPrice += distanceCharge;
    adjustments.push({
      factor: 'Distance Charge',
      adjustment: distanceCharge,
      reason: `${factors.distance.toFixed(1)}km distance`
    });
  }

  // High demand adjustment for popular providers
  const completionRate = (provider.bookings.filter((b: any) => b.status === 'COMPLETED').length / provider.bookings.length) * 100;
  if (completionRate >= 95 && provider.bookings.length >= 20) {
    const popularityBonus = Math.round(basePrice * 0.05);
    finalPrice += popularityBonus;
    adjustments.push({
      factor: 'Popularity Bonus',
      adjustment: popularityBonus,
      reason: 'High demand provider with excellent track record'
    });
  }

  // Availability discount
  if (provider.providerStatus?.isAvailable && provider.providerStatus?.currentCapacity < provider.providerStatus?.maxCapacity * 0.5) {
    const availabilityDiscount = Math.round(basePrice * 0.05);
    finalPrice -= availabilityDiscount;
    adjustments.push({
      factor: 'Availability Discount',
      adjustment: -availabilityDiscount,
      reason: 'Provider has immediate availability'
    });
  }

  return {
    finalPrice,
    adjustments,
    breakdown: {
      basePrice,
      tierAdjustment: tierMultiplier !== 1.0 ? Math.round(basePrice * (tierMultiplier - 1)) : 0,
      experienceBonus: provider.yearsActive >= 5 ? Math.round(basePrice * 0.1) : 0,
      distanceCharge: factors.distance > 5 ? (factors.distance - 5) * 50 * 100 : 0,
      popularityBonus: completionRate >= 95 ? Math.round(basePrice * 0.05) : 0,
      availabilityDiscount: provider.providerStatus?.isAvailable ? Math.round(basePrice * 0.05) : 0
    }
  };
}