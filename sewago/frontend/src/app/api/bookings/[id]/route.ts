import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { mockStore } from '@/lib/mockStore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    
    // Type assertion for session user
    const sessionUser = session?.user as any;
    
    if (!sessionUser?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use mock store for now
    const booking = await mockStore.findBookingById(id);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns this booking or is admin
    if (booking.userId !== sessionUser.id && sessionUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Get booking detail API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
