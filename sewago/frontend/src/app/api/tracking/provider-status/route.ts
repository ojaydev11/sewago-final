import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth-guards';

// GET /api/tracking/provider-status - Get provider status and capacity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Get provider with status and active bookings
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        providerStatus: true,
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED', 'PROVIDER_ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS']
            }
          },
          select: {
            id: true,
            status: true,
            scheduledAt: true
          }
        }
      }
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    const status = provider.providerStatus;
    const activeBookings = provider.bookings;

    // Calculate next available slot based on current bookings
    let nextAvailableSlot = null;
    if (status && status.currentCapacity >= status.maxCapacity) {
      // Simple estimation - in production, use more sophisticated scheduling
      const averageServiceTime = 60; // 60 minutes average
      const estimatedMinutes = averageServiceTime * (status.currentCapacity - status.maxCapacity + 1);
      nextAvailableSlot = new Date(Date.now() + estimatedMinutes * 60000).toISOString();
    }

    const responseData = {
      providerId: provider.id,
      status: status?.status || 'OFFLINE',
      currentCapacity: status?.currentCapacity || 0,
      maxCapacity: status?.maxCapacity || 5,
      currentServiceArea: status?.currentServiceArea,
      lastStatusUpdate: status?.lastStatusUpdate?.toISOString() || provider.updatedAt.toISOString(),
      isAvailable: status?.isAvailable || false,
      estimatedAvailableAt: status?.estimatedAvailableAt?.toISOString(),
      currentBookingId: status?.currentBookingId,
      activeBookings: activeBookings.map(b => b.id),
      workingHours: {
        start: '09:00',
        end: '18:00',
        days: [1, 2, 3, 4, 5, 6] // Monday to Saturday
      },
      nextAvailableSlot
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching provider status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider status' },
      { status: 500 }
    );
  }
}

// POST /api/tracking/provider-status - Update provider status
export async function POST(request: NextRequest) {
  return withAuth(async (req: NextRequest, { user }: any) => {
    try {
      const body = await request.json();
      const {
        providerId,
        status,
        reason,
        estimatedDuration,
        location
      } = body;

      if (!providerId || !status) {
        return NextResponse.json(
          { error: 'Provider ID and status are required' },
          { status: 400 }
        );
      }

      // Verify provider exists
      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        include: { providerStatus: true }
      });

      if (!provider) {
        return NextResponse.json(
          { error: 'Provider not found' },
          { status: 404 }
        );
      }

      // Calculate availability based on status
      const isAvailable = ['AVAILABLE'].includes(status);
      let estimatedAvailableAt = null;
      
      if (!isAvailable && estimatedDuration) {
        estimatedAvailableAt = new Date(Date.now() + estimatedDuration * 60000);
      }

      // Update or create provider status
      const updatedStatus = await prisma.providerStatus.upsert({
        where: { providerId },
        create: {
          providerId,
          status,
          isAvailable,
          estimatedAvailableAt,
          lastStatusUpdate: new Date()
        },
        update: {
          status,
          isAvailable,
          estimatedAvailableAt,
          lastStatusUpdate: new Date()
        }
      });

      // Update provider location if provided
      if (location) {
        await prisma.provider.update({
          where: { id: providerId },
          data: {
            currentLat: location.lat,
            currentLng: location.lng,
            updatedAt: new Date()
          }
        });
      }

      // Log transparency action
      await prisma.transparencyLog.create({
        data: {
          entityType: 'provider',
          entityId: providerId,
          action: 'STATUS_CHANGE',
          data: {
            previousStatus: provider.providerStatus?.status,
            newStatus: status,
            reason,
            estimatedDuration
          },
          providerId
        }
      });

      // In production, broadcast via WebSocket
      // io.emit('provider_status_update', { providerId, status, isAvailable, ... });

      return NextResponse.json({
        success: true,
        message: 'Status updated successfully',
        status: updatedStatus
      });
    } catch (error) {
      console.error('Error updating provider status:', error);
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 500 }
      );
    }
  })(request);
}