import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.serviceId || !body.date || !body.timeSlot || !body.address) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Forward the request to backend
    const response = await api.post('/bookings', body, {
      headers: {
        // Forward cookies for authentication
        'Cookie': request.headers.get('Cookie') || '',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Booking initiation error:', error);
    
    if (error.response) {
      return NextResponse.json(
        { success: false, message: error.response.data?.message || 'Booking failed' },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
