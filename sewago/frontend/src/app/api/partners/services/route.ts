
// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

export async function GET(request: NextRequest) {
  if (!FEATURE_FLAGS.PARTNER_API_ENABLED) {
    return NextResponse.json(
      { error: 'Partner API is disabled' },
      { status: 503 }
    );
  }

  // Verify API token
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  if (!isValidPartnerToken(token)) {
    return NextResponse.json(
      { error: 'Invalid partner token' },
      { status: 401 }
    );
  }

  try {
    // Mock services data (replace with actual database query)
    const services = [
      {
        id: 'house-cleaning',
        name: 'House Cleaning',
        category: 'cleaning',
        basePrice: 1500, // in paisa
        duration: 120, // minutes
        cities: ['kathmandu', 'pokhara', 'chitwan'],
        active: true
      },
      {
        id: 'electrical-work',
        name: 'Electrical Work',
        category: 'repairs',
        basePrice: 2000,
        duration: 90,
        cities: ['kathmandu', 'lalitpur', 'bhaktapur'],
        active: true
      }
    ];

    return NextResponse.json({
      success: true,
      data: services,
      meta: {
        count: services.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Partner API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function isValidPartnerToken(token: string): boolean {
  // In production, validate against database
  const validTokens = [
    process.env.PARTNER_API_TOKEN_1,
    process.env.PARTNER_API_TOKEN_2
  ].filter(Boolean);
  
  return validTokens.includes(token);
}
