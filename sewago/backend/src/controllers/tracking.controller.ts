import { Request, Response } from 'express';
import { BookingModel } from '../models/Booking.js';
import { ProviderModel } from '../models/Provider.js';
import { emitToBookingRoom } from '../socket-server.js';

// Update provider location
export async function updateProviderLocation(req: Request, res: Response) {
    try {
      const { lat, lng, isOnline } = req.body;
      const providerId = (req as any).userId; // From auth middleware
      
      if (lat === undefined || lng === undefined) {
        return res.status(400).json({ 
          error: 'Missing required fields: lat, lng' 
        });
      }

      // Update provider location in database
      const provider = await ProviderModel.findByIdAndUpdate(
        providerId,
        { 
          currentLat: lat, 
          currentLng: lng,
          isOnline: isOnline !== undefined ? isOnline : true
        },
        { new: true }
      );

      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      // Get all active bookings for this provider
      const activeBookings = await BookingModel.find({
        providerId: providerId,
        status: { $in: ["PROVIDER_ASSIGNED", "EN_ROUTE", "IN_PROGRESS"] }
      });

      // Emit real-time updates to all active bookings
      const io = req.app.get('io');
      if (io) {
        activeBookings.forEach(booking => {
          emitToBookingRoom(io, booking._id.toString(), 'providerLocationUpdated', {
            providerId,
            lat,
            lng,
            isOnline: provider.isOnline,
            timestamp: new Date(),
          });
        });
      }

      res.json({ 
        success: true, 
        message: 'Location updated successfully',
        location: {
          lat: provider.currentLat,
          lng: provider.currentLng,
          isOnline: provider.isOnline,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Error updating provider location:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

// Update provider status
export async function updateProviderStatus(req: Request, res: Response) {
    try {
      const { isOnline, status } = req.body;
      const providerId = (req as any).userId; // From auth middleware
      
      if (isOnline === undefined) {
        return res.status(400).json({ 
          error: 'Missing required field: isOnline' 
        });
      }

      // Update provider status
      const provider = await ProviderModel.findByIdAndUpdate(
        providerId,
        { isOnline },
        { new: true }
      );

      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      // If provider is going offline, update any active bookings
      if (!isOnline) {
        const activeBookings = await BookingModel.find({
          providerId: providerId,
          status: { $in: ["PROVIDER_ASSIGNED", "EN_ROUTE", "IN_PROGRESS"] }
        });

        // Update all active bookings to PENDING_CONFIRMATION and remove provider
        if (activeBookings.length > 0) {
          await BookingModel.updateMany(
            { _id: { $in: activeBookings.map(b => b._id) } },
            { 
              status: "PENDING_CONFIRMATION",
              providerId: null
            }
          );

          // Emit real-time updates to all affected bookings
          const io = req.app.get('io');
          if (io) {
            activeBookings.forEach(booking => {
              emitToBookingRoom(io, booking._id.toString(), 'providerStatusUpdated', {
                providerId,
                isOnline: false,
                message: 'Provider is now offline',
                timestamp: new Date(),
              });
            });
          }
        }
      }

      res.json({ 
        success: true, 
        message: 'Status updated successfully',
        status: {
          isOnline: provider.isOnline,
          timestamp: new Date()
        }
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
        .select('status providerId userId address')
        .populate('providerId', 'name phone verified currentLat currentLng isOnline')
        .populate('userId', 'name phone');

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Calculate ETA if provider is assigned and has location
      let eta = null;
      if (booking.providerId && 
          (booking.providerId as any).currentLat && 
          (booking.providerId as any).currentLng) {
        // For now, return a placeholder ETA
        // In a real implementation, you would calculate based on distance and traffic
        eta = {
          time: '15-20 minutes',
          minutes: 17,
          distance: '2.5 km'
        };
      }

      res.json({
        success: true,
        tracking: {
          currentStatus: booking.status,
          provider: booking.providerId,
          customer: booking.userId,
          address: booking.address,
          eta: eta
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
        .select('providerId address')
        .populate('providerId', 'currentLat currentLng');

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (!booking.providerId || 
          !(booking.providerId as any).currentLat || 
          !(booking.providerId as any).currentLng) {
        return res.status(400).json({ 
          error: 'Provider location not available' 
        });
      }

      // For now, return a placeholder ETA
      // In a real implementation, you would calculate based on distance and traffic
      const estimatedTimeMinutes = 15; // Default 15 minutes
      
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
          distance: '2.5 km' // Placeholder
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
