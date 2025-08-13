
import { NextRequest, NextResponse } from 'next/server';
import { featureFlags } from '@/lib/feature-flags';

export async function GET(request: NextRequest) {
  if (!featureFlags.PARTNER_API_ENABLED) {
    return NextResponse.json(
      { error: 'Partner API is disabled' },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  try {
    // Mock cities data
    const cities = [
      {
        id: 'kathmandu',
        name: 'Kathmandu',
        state: 'Bagmati',
        coordinates: { lat: 27.7172, lng: 85.3240 },
        servicesAvailable: ['house-cleaning', 'electrical-work', 'plumbing'],
        active: true
      },
      {
        id: 'pokhara',
        name: 'Pokhara',
        state: 'Gandaki',
        coordinates: { lat: 28.2096, lng: 83.9856 },
        servicesAvailable: ['house-cleaning', 'gardening'],
        active: true
      }
    ];

    return NextResponse.json({
      success: true,
      data: cities,
      meta: {
        count: cities.length,
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
