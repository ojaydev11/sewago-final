import { NextRequest, NextResponse } from 'next/server';
import { pricingEngine } from '@/lib/pricing';

export interface QuoteRequest {
  serviceSlug: string;
  serviceName: string;
  basePrice: number;
  isExpress: boolean;
  hasWarranty: boolean;
  city: string;
  preferredTime: Date;
}

export interface QuoteResponse {
  success: boolean;
  quote: {
    basePrice: number;
    expressSurcharge: number;
    warrantyFee: number;
    bookingFee: number;
    coinsCap: number;
    total: number;
    breakdown: string[];
  };
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: QuoteRequest = await request.json();
    const { serviceSlug, serviceName, basePrice, isExpress, hasWarranty, city, preferredTime } = body;

    // Validate required fields
    if (!serviceSlug || !basePrice || !city) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate pricing using the pricing engine
    const pricingResult = pricingEngine.calculatePrice(
      basePrice,
      serviceSlug,
      city,
      new Date(preferredTime),
      isExpress,
      'medium' // Default demand level
    );

    // Calculate additional fees
    const expressSurcharge = isExpress ? 500 : 0;
    const warrantyFee = hasWarranty ? Math.round(basePrice * 0.15) : 0;
    const bookingFee = 39; // Rs 39 unless member
    const coinsCap = Math.round((basePrice + expressSurcharge + warrantyFee) * 0.1);
    
    const total = basePrice + expressSurcharge + warrantyFee + bookingFee;

    // Create breakdown explanation
    const breakdown = [
      `Base Price (30 min): Rs ${basePrice.toLocaleString()}`,
      ...(isExpress ? [`Express Surcharge: +Rs ${expressSurcharge.toLocaleString()}`] : []),
      ...(hasWarranty ? [`Warranty Fee: +Rs ${warrantyFee.toLocaleString()}`] : []),
      `Booking Fee: Rs ${bookingFee.toLocaleString()}`,
      `Coins Cap (≤10%): -Rs ${coinsCap.toLocaleString()}`,
      `Total: Rs ${total.toLocaleString()}`
    ];

    const quote: QuoteResponse['quote'] = {
      basePrice,
      expressSurcharge,
      warrantyFee,
      bookingFee,
      coinsCap,
      total,
      breakdown
    };

    return NextResponse.json({
      success: true,
      quote
    });

  } catch (error) {
    console.error('Error calculating quote:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to calculate quote' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Quote API - Use POST method with service details' },
    { status: 200 }
  );
}
