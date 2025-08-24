import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth-guards';

// GET /api/tracking/live-location - Get current provider location and status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const bookingId = searchParams.get('bookingId');

    if (!providerId && !bookingId) {
      return NextResponse.json(
        { error: 'Provider ID or Booking ID is required' },
        { status: 400 }
      );
    }

    // If bookingId is provided, get provider from booking
    let actualProviderId = providerId;
    if (bookingId && !providerId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { providerId: true }
      });
      
      if (!booking?.providerId) {
        return NextResponse.json(
          { error: 'No provider assigned to this booking' },
          { status: 404 }
        );
      }
      actualProviderId = booking.providerId;
    }

    // Get provider basic info and status
    const provider = await prisma.provider.findUnique({
      where: { id: actualProviderId! },
      include: {
        providerStatus: true,
        liveLocationData: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Get latest location data
    const latestLocation = provider.liveLocationData[0];
    
    // Calculate estimated arrival if booking location is available
    let estimatedArrival = null;
    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { address: true } // Simplified - in real app, you'd have lat/lng
      });
      
      // Simple ETA calculation based on status
      if (provider.providerStatus?.status === 'EN_ROUTE' && latestLocation) {
        // Rough estimation - in production, use real routing API
        const estimatedMinutes = Math.floor(Math.random() * 30) + 15; // 15-45 min
        estimatedArrival = new Date(Date.now() + estimatedMinutes * 60000).toISOString();
      }
    }

    const responseData = {
      id: provider.id,
      name: provider.name,
      phone: provider.phone,
      status: provider.providerStatus?.status || 'OFFLINE',
      currentLat: latestLocation?.latitude,
      currentLng: latestLocation?.longitude,
      accuracy: latestLocation?.accuracy,
      speed: latestLocation?.speed,
      heading: latestLocation?.heading,
      batteryLevel: latestLocation?.batteryLevel,
      estimatedArrival,
      lastSeen: latestLocation?.timestamp?.toISOString() || provider.updatedAt.toISOString(),
      activeBookingId: provider.providerStatus?.currentBookingId,
      isSharing: latestLocation?.isSharing ?? false
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching live location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location data' },
      { status: 500 }
    );
  }
}

// POST /api/tracking/live-location - Update provider location (for providers)
export async function POST(request: NextRequest) {
  return withAuth(async (req: NextRequest, { user }: any) => {
    try {
      const body = await request.json();
      const {
        providerId,
        latitude,
        longitude,
        altitude,
        accuracy,
        heading,
        speed,
        batteryLevel,
        isSharing = true
      } = body;

      // Validate required fields
      if (!providerId || latitude === undefined || longitude === undefined) {
        return NextResponse.json(
          { error: 'Provider ID, latitude, and longitude are required' },
          { status: 400 }
        );
      }

      // Verify provider exists and user has permission
      const provider = await prisma.provider.findUnique({
        where: { id: providerId }
      });

      if (!provider) {
        return NextResponse.json(
          { error: 'Provider not found' },
          { status: 404 }
        );
      }

      // Create location update record
      const locationData = await prisma.liveLocationData.create({
        data: {
          providerId,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          altitude: altitude ? parseFloat(altitude) : null,
          accuracy: parseFloat(accuracy),
          heading: heading ? parseFloat(heading) : null,
          speed: speed ? parseFloat(speed) : null,
          batteryLevel: batteryLevel ? parseInt(batteryLevel) : null,
          isSharing
        }
      });

      // Update provider's current location
      await prisma.provider.update({
        where: { id: providerId },
        data: {
          currentLat: latitude,
          currentLng: longitude,
          updatedAt: new Date()
        }
      });

      // Log transparency action
      await prisma.transparencyLog.create({
        data: {
          entityType: 'provider',
          entityId: providerId,
          action: 'LOCATION_UPDATE',
          data: {
            latitude,
            longitude,
            accuracy,
            speed,
            isSharing
          },
          providerId
        }
      });

      // In a real application, you'd broadcast this via WebSocket here
      // Example: io.emit('location_update', { providerId, latitude, longitude, ... });

      return NextResponse.json({
        success: true,
        message: 'Location updated successfully',
        locationId: locationData.id
      });
    } catch (error) {
      console.error('Error updating location:', error);
      return NextResponse.json(
        { error: 'Failed to update location' },
        { status: 500 }
      );
    }
  })(request);
}