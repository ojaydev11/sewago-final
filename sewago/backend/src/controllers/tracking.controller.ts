import { Request, Response } from 'express';
import { Booking } from '../models/Booking.js';

export class TrackingController {
  // Update provider location
  static async updateProviderLocation(req: Request, res: Response) {
    try {
      const { providerId, bookingId, latitude, longitude } = req.body;
      
      if (!providerId || !bookingId || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ 
          error: 'Missing required fields: providerId, bookingId, latitude, longitude' 
        });
      }

      // Verify the booking exists and provider is assigned
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (booking.providerId?.toString() !== providerId) {
        return res.status(403).json({ error: 'Provider not assigned to this booking' });
      }

      // Update booking with new location
      const locationUpdate = {
        latitude,
        longitude,
        timestamp: new Date()
      };

      await Booking.findByIdAndUpdate(bookingId, {
        $push: { locationHistory: locationUpdate },
        $set: { 
          currentProviderLocation: locationUpdate,
          lastLocationUpdate: new Date()
        }
      });

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
  static async updateProviderStatus(req: Request, res: Response) {
    try {
      const { providerId, bookingId, status, message } = req.body;
      
      if (!providerId || !bookingId || !status) {
        return res.status(400).json({ 
          error: 'Missing required fields: providerId, bookingId, status' 
        });
      }

      // Verify the booking exists and provider is assigned
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (booking.providerId?.toString() !== providerId) {
        return res.status(403).json({ error: 'Provider not assigned to this booking' });
      }

      // Update booking status
      const statusUpdate = {
        status,
        timestamp: new Date(),
        message: message || `Status changed to ${status}`,
        updatedBy: providerId
      };

      await Booking.findByIdAndUpdate(bookingId, {
        $push: { statusHistory: statusUpdate },
        $set: { 
          currentStatus: status,
          lastStatusUpdate: new Date()
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
  static async getTrackingInfo(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      
      const booking = await Booking.findById(bookingId)
        .select('currentProviderLocation currentStatus statusHistory locationHistory providerId customerId')
        .populate('providerId', 'name phone rating')
        .populate('customerId', 'name phone');

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      res.json({
        success: true,
        tracking: {
          currentLocation: booking.currentProviderLocation,
          currentStatus: booking.currentStatus,
          statusHistory: booking.statusHistory,
          locationHistory: booking.locationHistory,
          provider: booking.providerId,
          customer: booking.customerId
        }
      });

    } catch (error) {
      console.error('Error getting tracking info:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get ETA for a booking
  static async getETA(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      
      const booking = await Booking.findById(bookingId)
        .select('currentProviderLocation customerLocation scheduledTime');

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (!booking.currentProviderLocation || !booking.customerLocation) {
        return res.status(400).json({ error: 'Location information not available' });
      }

      // Calculate distance and ETA
      const distance = this.calculateDistance(
        booking.currentProviderLocation.latitude,
        booking.currentProviderLocation.longitude,
        booking.customerLocation.latitude,
        booking.customerLocation.longitude
      );

      // Assume average speed of 30 km/h for urban areas
      const estimatedTimeMinutes = Math.round((distance / 30) * 60);
      
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
          distance: `${distance.toFixed(1)} km`
        }
      });

    } catch (error) {
      console.error('Error calculating ETA:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper method to calculate distance between two points
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}
