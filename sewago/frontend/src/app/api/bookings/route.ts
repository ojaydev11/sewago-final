import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { z } from 'zod';

const createBookingSchema = z.object({
  serviceId: z.string(),
  scheduledAt: z.string().datetime(),
  priceEstimateMin: z.number().min(0),
  priceEstimateMax: z.number().min(0),
  addressId: z.string(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    // Create booking via backend API
    const response = await api.post('/bookings', {
      userId: session.user.id,
      ...validatedData,
    });

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    // Handle axios errors
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number; data: Record<string, unknown> } };
      return NextResponse.json(
        axiosError.response.data,
        { status: axiosError.response.status }
      );
    }

    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build query parameters for backend API
    const params = new URLSearchParams({ userId: session.user.id });
    if (status && status !== 'all') {
      params.set('status', status);
    }

    const response = await api.get(`/bookings?${params.toString()}`);

    return NextResponse.json(response.data);
  } catch (error) {
    // Handle axios errors
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number; data: Record<string, unknown> } };
      return NextResponse.json(
        axiosError.response.data,
        { status: axiosError.response.status }
      );
    }

    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
