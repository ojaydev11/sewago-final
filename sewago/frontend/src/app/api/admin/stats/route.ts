import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Service } from '@/models/Service';
import { User } from '@/models/User';
import { Booking } from '@/models/Booking';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get counts
    const totalServices = await Service.countDocuments({ active: true });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalBookings = await Booking.countDocuments({});
    
    // Get booking status counts
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    
    // Calculate total revenue from completed bookings
    const completedBookingsData = await Booking.find({ status: 'completed' })
      .populate('serviceId', 'basePrice');
    
    const totalRevenue = completedBookingsData.reduce((sum, booking) => {
      return sum + ((booking.serviceId as any)?.basePrice || 0);
    }, 0);

    const stats = {
      totalServices,
      totalProviders,
      totalCustomers,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
