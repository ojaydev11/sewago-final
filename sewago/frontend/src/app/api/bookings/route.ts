import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import type { $Enums as PrismaEnums } from '@prisma/client';

const createBookingSchema = z.object({
  serviceId: z.string(),
  scheduledAt: z.string().datetime(),
  address: z.string().min(3),
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

    const booking = await db.booking.create({
      data: {
        userId: session.user.id,
        serviceId: validatedData.serviceId,
        scheduledAt: new Date(validatedData.scheduledAt),
        address: validatedData.address,
        notes: validatedData.notes,
      }
    });

    return NextResponse.json({ booking }, { status: 201 });
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
    const whereClause: { userId: string; status?: PrismaEnums.BookingStatus } = { userId: session.user.id };
    if (status && status !== 'all') {
      const AllowedBookingStatuses: readonly PrismaEnums.BookingStatus[] = [
        'PENDING_CONFIRMATION','CONFIRMED','PROVIDER_ASSIGNED','EN_ROUTE','IN_PROGRESS','COMPLETED','CANCELED','DISPUTED'
      ];
      if (AllowedBookingStatuses.includes(status as PrismaEnums.BookingStatus)) {
        whereClause.status = status as PrismaEnums.BookingStatus;
      }
    }
    const bookings = await db.booking.findMany({ where: whereClause });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
