import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/Booking';
import { ProviderProfile } from '@/models/ProviderProfile';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'provider') {
      return NextResponse.json(
        { error: 'Unauthorized - Provider access required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const providerId = session.user.id;

    // Get all bookings for this provider
    const allBookings = await Booking.find({
      $or: [
        { providerId: providerId },
        { status: 'pending' } // Include pending bookings that haven't been assigned yet
      ]
    }).populate('serviceId', 'basePrice');

    // Get provider profile for rating
    const providerProfile = await ProviderProfile.findOne({ userId: providerId });

    // Calculate stats
    const totalJobs = allBookings.length;
    const completedJobs = allBookings.filter(booking => booking.status === 'completed').length;
    const pendingJobs = allBookings.filter(booking => booking.status === 'pending').length;
    
    // Calculate total earnings from completed jobs
    const totalEarnings = allBookings
      .filter(booking => booking.status === 'completed' && booking.providerId?.toString() === providerId)
      .reduce((sum, booking) => sum + (booking.serviceId as any).basePrice, 0);

    // Get average rating from provider profile
    const averageRating = providerProfile?.ratingAvg || 0;

    const stats = {
      totalJobs,
      completedJobs,
      pendingJobs,
      totalEarnings,
      averageRating
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching provider stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
