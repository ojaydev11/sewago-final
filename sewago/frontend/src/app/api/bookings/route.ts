import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/Booking';
import { Service } from '@/models/Service';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { serviceId, date, timeSlot, address, notes } = await request.json();

    // Validation
    if (!serviceId || !date || !timeSlot || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify service exists and is active
    const service = await Service.findById(serviceId);
    if (!service || !service.active) {
      return NextResponse.json(
        { error: 'Service not found or inactive' },
        { status: 404 }
      );
    }

    // Create booking
    const booking = await Booking.create({
      customerId: session.user.id,
      serviceId,
      date: new Date(date),
      timeSlot,
      address,
      notes: notes || '',
      status: 'pending',
    });

    // Populate service details for response
    await booking.populate('serviceId');

    return NextResponse.json({
      message: 'Booking created successfully',
      booking,
    }, { status: 201 });

  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || session.user.role;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    // Build query based on user role
    let query: any = {};

    if (role === 'customer') {
      query.customerId = session.user.id;
    } else if (role === 'provider') {
      query.providerId = session.user.id;
    } else if (role === 'admin') {
      // Admin can see all bookings
    } else {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Filter by status if specified
    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('serviceId', 'name category basePrice')
        .populate('customerId', 'name email phone')
        .populate('providerId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query)
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
