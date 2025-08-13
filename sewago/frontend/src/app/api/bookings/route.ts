import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { Service } from '@/models/Service';
import { User } from '@/models/User';

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { serviceSlug, date, timeSlot, address, notes } = body;

    // Validate required fields
    if (!serviceSlug || !date || !timeSlot || !address) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the service
    const service = await Service.findOne({ slug: serviceSlug, active: true });
    if (!service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    // Find the user
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Create the booking
    const booking = new Booking({
      customerId: user._id,
      serviceId: service._id,
      date: new Date(date),
      timeSlot,
      address,
      notes: notes || '',
      status: 'pending'
    });

    await booking.save();

    // Populate the booking with service and customer details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('serviceId', 'name slug basePrice')
      .populate('customerId', 'name email phone')
      .lean();

    return NextResponse.json(
      { 
        message: 'Booking created successfully',
        booking: populatedBooking
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/bookings - Get bookings based on user role
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

               const query: any = {};
    let populateFields = '';

    // Build query based on user role
    switch (session.user.role) {
      case 'customer':
        query.customerId = session.user.id;
        populateFields = 'serviceId providerId';
        break;
      case 'provider':
        query.providerId = session.user.id;
        populateFields = 'serviceId customerId';
        break;
      case 'admin':
        // Admins can see all bookings
        populateFields = 'serviceId customerId providerId';
        break;
      default:
        return NextResponse.json(
          { message: 'Invalid user role' },
          { status: 400 }
        );
    }

    // Add status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch bookings
    const bookings = await Booking.find(query)
      .populate('serviceId', 'name slug basePrice category')
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Booking.countDocuments(query);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
