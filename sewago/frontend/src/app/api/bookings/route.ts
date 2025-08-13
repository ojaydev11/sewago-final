import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { mockStore } from '@/lib/mockStore';

const createBookingSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  scheduledAt: z.string().datetime('Invalid date format'),
  address: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    city: z.string().min(1, 'City is required'),
  }),
  notes: z.string().optional(),
  priceEstimateMin: z.number().min(0, 'Price estimate must be positive'),
  priceEstimateMax: z.number().min(0, 'Price estimate must be positive'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use mock store for now
    const bookings = await mockStore.findBookings({ userId: session.user.id });
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Get bookings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { serviceId, scheduledAt, address, notes, priceEstimateMin, priceEstimateMax } = 
      createBookingSchema.parse(body);

    // Use mock store for now
    const booking = await mockStore.createBooking({
      userId: session.user.id,
      serviceId,
      scheduledAt: new Date(scheduledAt),
      address,
      notes,
      priceEstimateMin,
      priceEstimateMax,
    });
    
    return NextResponse.json({
      message: 'Booking created successfully (mock mode)',
      booking,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create booking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
