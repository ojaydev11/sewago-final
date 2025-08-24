'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSocket } from './useSocket';

interface LocationData {
  providerId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  heading?: number;
  speed?: number;
  batteryLevel?: number;
  timestamp: string;
  isSharing: boolean;
}

interface ProviderData {
  id: string;
  name: string;
  phone: string;
  status: 'AVAILABLE' | 'BUSY' | 'EN_ROUTE' | 'OFFLINE' | 'BREAK' | 'EMERGENCY' | 'UNAVAILABLE';
  currentLat?: number;
  currentLng?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
  estimatedArrival?: string;
  lastSeen: string;
  activeBookingId?: string;
}

interface TrackingOptions {
  updateInterval?: number; // in seconds
  highAccuracyMode?: boolean;
  enableBatteryOptimization?: boolean;
}

export function useLiveTracking() {
  const [trackedProviders, setTrackedProviders] = useState<Map<string, ProviderData>>(new Map());
  const [locationHistory, setLocationHistory] = useState<Map<string, LocationData[]>>(new Map());
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { socket, isConnected } = useSocket();

  // Track a provider
  const trackProvider = useCallback(async (providerId: string, options?: TrackingOptions): Promise<ProviderData> => {
    try {
      setError(null);
      
      // Fetch initial provider data
      const response = await fetch(`/api/tracking/live-location?providerId=${providerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch provider data');
      }
      
      const providerData: ProviderData = await response.json();
      
      // Update tracked providers
      setTrackedProviders(prev => {
        const updated = new Map(prev);
        updated.set(providerId, providerData);
        return updated;
      });

      // Subscribe to real-time updates via socket
      if (socket && isConnected) {
        socket.emit('subscribe_provider_tracking', { 
          providerId,
          options: options || {}
        });
      }

      setIsTracking(true);
      return providerData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [socket, isConnected]);

  // Stop tracking a provider
  const stopTracking = useCallback((providerId: string) => {
    setTrackedProviders(prev => {
      const updated = new Map(prev);
      updated.delete(providerId);
      return updated;
    });

    setLocationHistory(prev => {
      const updated = new Map(prev);
      updated.delete(providerId);
      return updated;
    });

    if (socket && isConnected) {
      socket.emit('unsubscribe_provider_tracking', { providerId });
    }

    setIsTracking(trackedProviders.size > 1);
  }, [socket, isConnected, trackedProviders.size]);

  // Calculate ETA based on current location and destination
  const calculateETA = useCallback(async (
    providerId: string, 
    destinationLat: number, 
    destinationLng: number
  ): Promise<string | null> => {
    const provider = trackedProviders.get(providerId);
    if (!provider?.currentLat || !provider?.currentLng) {
      return null;
    }

    try {
      const response = await fetch('/api/tracking/route-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          origin: { lat: provider.currentLat, lng: provider.currentLng },
          destination: { lat: destinationLat, lng: destinationLng },
          includeTraffic: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate ETA');
      }

      const data = await response.json();
      return data.estimatedArrival;
    } catch (error) {
      console.error('ETA calculation failed:', error);
      return null;
    }
  }, [trackedProviders]);

  // Get location accuracy level
  const getLocationAccuracy = useCallback((accuracy?: number): 'HIGH' | 'MEDIUM' | 'LOW' => {
    if (!accuracy) return 'LOW';
    if (accuracy <= 10) return 'HIGH';
    if (accuracy <= 50) return 'MEDIUM';
    return 'LOW';
  }, []);

  // Calculate distance between two points
  const calculateDistance = useCallback((
    lat1: number, lng1: number, 
    lat2: number, lng2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }, []);

  // Get provider's movement trend
  const getMovementTrend = useCallback((providerId: string): 'APPROACHING' | 'MOVING_AWAY' | 'STATIONARY' | 'UNKNOWN' => {
    const history = locationHistory.get(providerId);
    if (!history || history.length < 2) return 'UNKNOWN';

    const recent = history.slice(-2);
    const [prev, current] = recent;
    
    if (!prev.speed || prev.speed < 1) return 'STATIONARY';
    
    // This would require destination coordinates to determine if approaching
    // For now, return based on speed changes
    if (current.speed && current.speed > prev.speed) return 'APPROACHING';
    if (current.speed && current.speed < prev.speed) return 'MOVING_AWAY';
    
    return 'STATIONARY';
  }, [locationHistory]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleLocationUpdate = (data: LocationData) => {
      // Update provider location
      setTrackedProviders(prev => {
        const updated = new Map(prev);
        const provider = updated.get(data.providerId);
        if (provider) {
          updated.set(data.providerId, {
            ...provider,
            currentLat: data.latitude,
            currentLng: data.longitude,
            accuracy: data.accuracy,
            speed: data.speed,
            heading: data.heading,
            batteryLevel: data.batteryLevel,
            lastSeen: data.timestamp
          });
        }
        return updated;
      });

      // Update location history
      setLocationHistory(prev => {
        const updated = new Map(prev);
        const history = updated.get(data.providerId) || [];
        // Keep only last 50 location points
        const newHistory = [...history, data].slice(-50);
        updated.set(data.providerId, newHistory);
        return updated;
      });
    };

    const handleStatusUpdate = (data: { 
      providerId: string; 
      status: ProviderData['status']; 
      estimatedArrival?: string; 
    }) => {
      setTrackedProviders(prev => {
        const updated = new Map(prev);
        const provider = updated.get(data.providerId);
        if (provider) {
          updated.set(data.providerId, {
            ...provider,
            status: data.status,
            estimatedArrival: data.estimatedArrival,
            lastSeen: new Date().toISOString()
          });
        }
        return updated;
      });
    };

    const handleTrackingError = (data: { providerId: string; error: string }) => {
      setError(`Tracking error for provider ${data.providerId}: ${data.error}`);
    };

    socket.on('location_update', handleLocationUpdate);
    socket.on('provider_status_update', handleStatusUpdate);
    socket.on('tracking_error', handleTrackingError);

    return () => {
      socket.off('location_update', handleLocationUpdate);
      socket.off('provider_status_update', handleStatusUpdate);
      socket.off('tracking_error', handleTrackingError);
    };
  }, [socket, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket && isConnected) {
        // Unsubscribe from all tracking
        trackedProviders.forEach((_, providerId) => {
          socket.emit('unsubscribe_provider_tracking', { providerId });
        });
      }
    };
  }, [socket, isConnected, trackedProviders]);

  return {
    trackedProviders: Array.from(trackedProviders.values()),
    locationHistory,
    isTracking,
    error,
    trackProvider,
    stopTracking,
    calculateETA,
    getLocationAccuracy,
    calculateDistance,
    getMovementTrend,
    isConnected
  };
}