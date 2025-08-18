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

    const resp = await api.post('/bookings', {
      serviceId: validatedData.serviceId,
      date: new Date(validatedData.scheduledAt).toISOString(),
      timeSlot: 'custom',
      address: validatedData.addressId,
      notes: validatedData.notes,
    }, {
      headers: {
        Authorization: `Bearer ${session?.user?.id ?? ''}`,
      }
    });
    return NextResponse.json(resp.data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
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

    const resp = await api.get('/bookings/me', {
      headers: {
        Authorization: `Bearer ${session?.user?.id ?? ''}`,
      },
      params: { status: status ?? undefined },
    });
    return NextResponse.json(resp.data);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
