import { NextRequest, NextResponse } from 'next/server';
// TODO: wire real auth once backend tokens are integrated
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
    // For now, accept unauthenticated to allow booking flow demo; replace with NextAuth session when backend JWT is available

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
        // TODO: include real auth token when available
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
    // Skipping auth temporarily; add NextAuth session validation when backend JWT is ready

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const resp = await api.get('/bookings/me', {
      headers: {},
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
