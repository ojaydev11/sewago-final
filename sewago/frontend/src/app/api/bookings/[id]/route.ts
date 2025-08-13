import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/Booking';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { status, providerId } = await request.json();

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get the booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check permissions based on user role
    const canUpdate = 
      (session.user as any).role === 'admin' ||
      ((session.user as any).role === 'customer' && booking.customerId.toString() === session.user.id) ||
      ((session.user as any).role === 'provider' && booking.providerId?.toString() === session.user.id);

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update the booking
    const updateData: any = {};
    if (status) updateData.status = status;
    if (providerId) updateData.providerId = providerId;
    updateData.updatedAt = new Date();

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('serviceId customerId providerId');

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: updatedBooking,
    });

  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const booking = await Booking.findById(id)
      .populate('serviceId', 'name category basePrice')
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name email phone')
      .lean();

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check permissions based on user role
    const canView = 
      (session.user as any).role === 'admin' ||
      ((session.user as any).role === 'customer' && booking.customerId._id.toString() === session.user.id) ||
      ((session.user as any).role === 'provider' && booking.providerId?._id.toString() === session.user.id);

    if (!canView) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({ booking });

  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
