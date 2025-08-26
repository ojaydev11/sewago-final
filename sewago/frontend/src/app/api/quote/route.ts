import 'server-only';
// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { pricing as pricingConfig } from '@/config/pricing';
import { formatNPR } from '@/lib/currency';
import { headers } from 'next/headers';

const QuoteSchema = z.object({
  serviceSlug: z.string().min(1),
  serviceName: z.string().min(1),
  basePrice: z.coerce.number().int().min(0),
  isExpress: z.boolean().optional().default(false),
  hasWarranty: z.boolean().optional().default(false),
  city: z.string().min(1).default('Kathmandu'),
  preferredTime: z.union([z.string(), z.date()]).optional(),
  extraBlocks: z.coerce.number().int().min(0).optional().default(0)
});

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

// simple per-IP rate limiter
declare global {
   
  var __quote_hits: Map<string, { count: number; ts: number }> | undefined
}

function rateLimit(ip: string, windowMs = 60_000, limit = 60) {
  const now = Date.now();
  if (!global.__quote_hits) global.__quote_hits = new Map();
  const hits = global.__quote_hits;
  const rec = hits.get(ip) ?? { count: 0, ts: now };
  if (now - rec.ts > windowMs) { rec.count = 0; rec.ts = now; }
  rec.count++;
  hits.set(ip, rec);
  return rec.count <= limit;
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const ip = (headersList.get('x-forwarded-for') || '').split(',')[0] || 'local';
    if (!rateLimit(ip)) {
      return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429, headers: { 'Cache-Control': 'no-store' } });
    }

    const json = await request.json();
    const parsed = QuoteSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Invalid input', errors: parsed.error.flatten() }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }
    const { serviceSlug, basePrice, isExpress, hasWarranty, city, extraBlocks } = parsed.data;

    // derive extra block price from config when available
    const extra15 = (pricingConfig.services as any)?.[serviceSlug]?.extra15 ?? 150;
    const extras = (extraBlocks ?? 0) * extra15;
    const expressSurcharge = isExpress ? pricingConfig.expressAddon.price : 0;
    const warrantyFee = hasWarranty ? (pricingConfig.warrantyAddon?.price ?? Math.round(basePrice * 0.15)) : 0;
    const bookingFee = pricingConfig.bookingFee;
    const coinsCap = Math.round((basePrice + extras + expressSurcharge + warrantyFee) * (pricingConfig.coins.maxRedeemPctOnLabour ?? 0.1));
    const total = basePrice + extras + expressSurcharge + warrantyFee + bookingFee;

    // Create breakdown explanation
    const breakdown = [
      `Base Price (30 min): ${formatNPR(basePrice)}`,
      ...(isExpress ? [`Express Surcharge: +${formatNPR(expressSurcharge)}`] : []),
      ...(hasWarranty ? [`Warranty Fee: +${formatNPR(warrantyFee)}`] : []),
      `Booking Fee: ${formatNPR(bookingFee)}`,
      `Coins Cap (≤10%): -${formatNPR(coinsCap)}`,
      `Total: ${formatNPR(total)}`
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

    return NextResponse.json({ success: true, quote }, { status: 200, headers: { 'Cache-Control': 'no-store' } });

  } catch (error) {
    console.error('Error calculating quote:', error);
    return NextResponse.json({ success: false, message: 'Failed to calculate quote' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function GET() {
  return new NextResponse('Method Not Allowed', { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } });
}
