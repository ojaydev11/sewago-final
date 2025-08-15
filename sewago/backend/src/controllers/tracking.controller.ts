import { Request, Response } from 'express';
import { BookingModel } from '../models/Booking.js';

// Update provider location
export async function updateProviderLocation(req: Request, res: Response) {
  try {
    const { providerId, bookingId, latitude, longitude } = req.body;
    
    if (!providerId || !bookingId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: providerId, bookingId, latitude, longitude' 
      });
    }

    // Verify the booking exists and provider is assigned
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.providerId?.toString() !== providerId) {
      return res.status(403).json({ error: 'Provider not assigned to this booking' });
    }

    // Note: Location tracking fields are not implemented in the current Booking model
    // In a real implementation, you would update these fields or use a separate tracking service
    const locationUpdate = {
      latitude,
      longitude,
      timestamp: new Date()
    };

    // For now, just log the location update
    console.log('Location update received:', locationUpdate);

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${bookingId}`).emit('providerLocationUpdate', locationUpdate);
    }

    res.json({ 
      success: true, 
      message: 'Location updated successfully',
      location: locationUpdate
    });

  } catch (error) {
    console.error('Error updating provider location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update provider status
export async function updateProviderStatus(req: Request, res: Response) {
  try {
    const { providerId, bookingId, status, message } = req.body;
    
    if (!providerId || !bookingId || !status) {
      return res.status(400).json({ 
        error: 'Missing required fields: providerId, bookingId, status' 
      });
    }

    // Verify the booking exists and provider is assigned
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.providerId?.toString() !== providerId) {
      return res.status(403).json({ error: 'Provider not assigned to this booking' });
    }

    // Update booking status (only the main status field is available in current model)
    const statusUpdate = {
      status,
      timestamp: new Date(),
      message: message || `Status changed to ${status}`,
      updatedBy: providerId
    };

    // Update the main status field
    await BookingModel.findByIdAndUpdate(bookingId, {
      $set: { 
        status: status
      }
    });

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${bookingId}`).emit('statusUpdate', statusUpdate);
    }

    res.json({ 
      success: true, 
      message: 'Status updated successfully',
      status: statusUpdate
    });

  } catch (error) {
    console.error('Error updating provider status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get tracking information for a booking
export async function getTrackingInfo(req: Request, res: Response) {
  try {
    const { bookingId } = req.params;
    
    const booking = await BookingModel.findById(bookingId)
      .select('status providerId userId')
      .populate('providerId', 'name phone rating')
      .populate('userId', 'name phone');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      success: true,
      tracking: {
        currentLocation: null, // Not implemented in current model
        currentStatus: booking.status,
        statusHistory: [], // Not implemented in current model
        locationHistory: [], // Not implemented in current model
        provider: booking.providerId,
        customer: booking.userId
      }
    });

  } catch (error) {
    console.error('Error getting tracking info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get ETA for a booking
export async function getETA(req: Request, res: Response) {
  try {
    const { bookingId } = req.params;
    
    const booking = await BookingModel.findById(bookingId)
      .select('date address');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // For now, return a placeholder ETA since location tracking is not implemented
    // In a real implementation, you would get provider and customer locations from a separate tracking service
    const estimatedTimeMinutes = 30; // Default 30 minutes
    
    let eta;
    if (estimatedTimeMinutes < 1) {
      eta = 'Less than 1 minute';
    } else if (estimatedTimeMinutes < 60) {
      eta = `${estimatedTimeMinutes} minutes`;
    } else {
      const hours = Math.floor(estimatedTimeMinutes / 60);
      const minutes = estimatedTimeMinutes % 60;
      eta = `${hours}h ${minutes}m`;
    }

    res.json({
      success: true,
      eta: {
        time: eta,
        minutes: estimatedTimeMinutes,
        distance: 'Location tracking not implemented'
      }
    });

  } catch (error) {
    console.error('Error calculating ETA:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}
