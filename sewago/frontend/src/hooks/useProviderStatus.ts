'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSocket } from './useSocket';

type ProviderStatusType = 
  | 'AVAILABLE'
  | 'BUSY'
  | 'EN_ROUTE'
  | 'OFFLINE'
  | 'BREAK'
  | 'EMERGENCY'
  | 'UNAVAILABLE';

interface ProviderStatusData {
  providerId: string;
  status: ProviderStatusType;
  currentCapacity: number;
  maxCapacity: number;
  currentServiceArea?: {
    center: { lat: number; lng: number };
    radius: number;
    boundaries?: Array<{ lat: number; lng: number }>;
  };
  lastStatusUpdate: string;
  isAvailable: boolean;
  estimatedAvailableAt?: string;
  currentBookingId?: string;
  activeBookings: string[];
  workingHours: {
    start: string;
    end: string;
    days: number[]; // 0-6, Sunday to Saturday
  };
  breakSchedule?: {
    start: string;
    end: string;
    reason: string;
  };
}

interface StatusUpdate {
  status: ProviderStatusType;
  reason?: string;
  estimatedDuration?: number; // minutes
  location?: { lat: number; lng: number };
}

interface CapacityManagement {
  currentLoad: number;
  maxLoad: number;
  queueLength: number;
  averageServiceTime: number;
  nextAvailableSlot?: string;
}

export function useProviderStatus() {
  const [statusData, setStatusData] = useState<ProviderStatusData | null>(null);
  const [capacityInfo, setCapacityInfo] = useState<CapacityManagement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoUpdate, setAutoUpdate] = useState(true);
  
  const { socket, isConnected } = useSocket();

  // Fetch provider status
  const fetchProviderStatus = useCallback(async (providerId: string): Promise<ProviderStatusData> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tracking/provider-status?providerId=${providerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch provider status');
      }

      const data: ProviderStatusData = await response.json();
      setStatusData(data);
      setIsLoading(false);

      // Subscribe to real-time updates
      if (socket && isConnected && autoUpdate) {
        socket.emit('subscribe_provider_status', { providerId });
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch provider status';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  }, [socket, isConnected, autoUpdate]);

  // Update provider status
  const updateStatus = useCallback(async (
    providerId: string,
    update: StatusUpdate
  ): Promise<void> => {
    try {
      const response = await fetch('/api/tracking/provider-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          ...update
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update provider status');
      }

      // Real-time update will handle state changes
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Set working hours
  const setWorkingHours = useCallback(async (
    providerId: string,
    workingHours: ProviderStatusData['workingHours']
  ): Promise<void> => {
    try {
      const response = await fetch('/api/tracking/provider-working-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          workingHours
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update working hours');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update working hours';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Schedule a break
  const scheduleBreak = useCallback(async (
    providerId: string,
    breakInfo: {
      start: string;
      duration: number; // minutes
      reason: string;
    }
  ): Promise<void> => {
    try {
      const response = await fetch('/api/tracking/provider-break', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          breakInfo
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule break');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule break';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Update service area
  const updateServiceArea = useCallback(async (
    providerId: string,
    serviceArea: ProviderStatusData['currentServiceArea']
  ): Promise<void> => {
    try {
      const response = await fetch('/api/tracking/provider-service-area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          serviceArea
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update service area');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update service area';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Get status display info
  const getStatusDisplayInfo = useCallback((status: ProviderStatusType) => {
    const statusInfo = {
      AVAILABLE: { 
        label: 'Available', 
        color: 'bg-green-500', 
        textColor: 'text-green-700',
        icon: '🟢',
        description: 'Ready to take new bookings'
      },
      BUSY: { 
        label: 'Busy', 
        color: 'bg-yellow-500', 
        textColor: 'text-yellow-700',
        icon: '🟡',
        description: 'Currently serving customers'
      },
      EN_ROUTE: { 
        label: 'En Route', 
        color: 'bg-blue-500', 
        textColor: 'text-blue-700',
        icon: '🔵',
        description: 'Traveling to customer location'
      },
      OFFLINE: { 
        label: 'Offline', 
        color: 'bg-gray-500', 
        textColor: 'text-gray-700',
        icon: '⚫',
        description: 'Not available for bookings'
      },
      BREAK: { 
        label: 'On Break', 
        color: 'bg-orange-500', 
        textColor: 'text-orange-700',
        icon: '🟠',
        description: 'Taking a scheduled break'
      },
      EMERGENCY: { 
        label: 'Emergency', 
        color: 'bg-red-500', 
        textColor: 'text-red-700',
        icon: '🔴',
        description: 'Handling emergency situation'
      },
      UNAVAILABLE: { 
        label: 'Unavailable', 
        color: 'bg-gray-400', 
        textColor: 'text-gray-600',
        icon: '⚪',
        description: 'Temporarily unavailable'
      }
    };

    return statusInfo[status];
  }, []);

  // Calculate availability percentage
  const calculateAvailabilityRate = useCallback((
    totalHours: number,
    availableHours: number,
    busyHours: number
  ): {
    availabilityRate: number;
    utilizationRate: number;
    efficiency: 'LOW' | 'MEDIUM' | 'HIGH';
  } => {
    const availabilityRate = (availableHours / totalHours) * 100;
    const utilizationRate = (busyHours / totalHours) * 100;
    
    let efficiency: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (utilizationRate >= 70) efficiency = 'HIGH';
    else if (utilizationRate >= 50) efficiency = 'MEDIUM';

    return {
      availabilityRate: Math.round(availabilityRate),
      utilizationRate: Math.round(utilizationRate),
      efficiency
    };
  }, []);

  // Check if provider is within working hours
  const isWithinWorkingHours = useCallback((workingHours?: ProviderStatusData['workingHours']): boolean => {
    if (!workingHours) return true;

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

    // Check if today is a working day
    if (!workingHours.days.includes(currentDay)) {
      return false;
    }

    // Parse working hours
    const [startHour, startMin] = workingHours.start.split(':').map(Number);
    const [endHour, endMin] = workingHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    return currentTime >= startTime && currentTime <= endTime;
  }, []);

  // Estimate next available time
  const estimateNextAvailableTime = useCallback((
    status: ProviderStatusType,
    currentCapacity: number,
    maxCapacity: number,
    averageServiceTime: number = 60, // minutes
    queueLength: number = 0
  ): string | null => {
    if (status === 'AVAILABLE' && currentCapacity < maxCapacity) {
      return 'Available now';
    }

    let estimatedMinutes = 0;

    switch (status) {
      case 'BUSY':
        // If at capacity, wait for current services to complete + queue
        if (currentCapacity >= maxCapacity) {
          estimatedMinutes = averageServiceTime + (queueLength * averageServiceTime);
        } else {
          estimatedMinutes = averageServiceTime * 0.5; // Partial service time
        }
        break;
      case 'EN_ROUTE':
        estimatedMinutes = 15; // Estimated travel time
        break;
      case 'BREAK':
        estimatedMinutes = 30; // Typical break duration
        break;
      case 'OFFLINE':
      case 'UNAVAILABLE':
        return null; // Cannot estimate
      case 'EMERGENCY':
        estimatedMinutes = 120; // Emergency handling time
        break;
      default:
        return null;
    }

    const nextAvailable = new Date();
    nextAvailable.setMinutes(nextAvailable.getMinutes() + estimatedMinutes);
    
    return nextAvailable.toISOString();
  }, []);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket || !isConnected || !autoUpdate) return;

    const handleStatusUpdate = (data: {
      providerId: string;
      status: ProviderStatusType;
      currentCapacity: number;
      isAvailable: boolean;
      estimatedAvailableAt?: string;
      lastStatusUpdate: string;
    }) => {
      if (statusData && data.providerId === statusData.providerId) {
        setStatusData(prev => prev ? {
          ...prev,
          status: data.status,
          currentCapacity: data.currentCapacity,
          isAvailable: data.isAvailable,
          estimatedAvailableAt: data.estimatedAvailableAt,
          lastStatusUpdate: data.lastStatusUpdate
        } : null);
      }
    };

    const handleCapacityUpdate = (data: {
      providerId: string;
      currentCapacity: number;
      queueLength: number;
      nextAvailableSlot?: string;
    }) => {
      if (statusData && data.providerId === statusData.providerId) {
        setStatusData(prev => prev ? {
          ...prev,
          currentCapacity: data.currentCapacity
        } : null);

        setCapacityInfo(prev => prev ? {
          ...prev,
          currentLoad: data.currentCapacity,
          queueLength: data.queueLength,
          nextAvailableSlot: data.nextAvailableSlot
        } : null);
      }
    };

    const handleBookingAssigned = (data: {
      providerId: string;
      bookingId: string;
    }) => {
      if (statusData && data.providerId === statusData.providerId) {
        setStatusData(prev => prev ? {
          ...prev,
          activeBookings: [...prev.activeBookings, data.bookingId],
          currentCapacity: prev.currentCapacity + 1,
          isAvailable: prev.currentCapacity + 1 < prev.maxCapacity
        } : null);
      }
    };

    const handleBookingCompleted = (data: {
      providerId: string;
      bookingId: string;
    }) => {
      if (statusData && data.providerId === statusData.providerId) {
        setStatusData(prev => prev ? {
          ...prev,
          activeBookings: prev.activeBookings.filter(id => id !== data.bookingId),
          currentCapacity: Math.max(0, prev.currentCapacity - 1),
          isAvailable: prev.currentCapacity - 1 < prev.maxCapacity
        } : null);
      }
    };

    socket.on('provider_status_update', handleStatusUpdate);
    socket.on('provider_capacity_update', handleCapacityUpdate);
    socket.on('booking_assigned', handleBookingAssigned);
    socket.on('booking_completed', handleBookingCompleted);

    return () => {
      socket.off('provider_status_update', handleStatusUpdate);
      socket.off('provider_capacity_update', handleCapacityUpdate);
      socket.off('booking_assigned', handleBookingAssigned);
      socket.off('booking_completed', handleBookingCompleted);
    };
  }, [socket, isConnected, autoUpdate, statusData]);

  // Toggle auto updates
  const toggleAutoUpdate = useCallback((enabled: boolean) => {
    setAutoUpdate(enabled);
    
    if (!enabled && socket && statusData) {
      socket.emit('unsubscribe_provider_status', { providerId: statusData.providerId });
    } else if (enabled && socket && statusData) {
      socket.emit('subscribe_provider_status', { providerId: statusData.providerId });
    }
  }, [socket, statusData]);

  return {
    statusData,
    capacityInfo,
    isLoading,
    error,
    autoUpdate,
    fetchProviderStatus,
    updateStatus,
    setWorkingHours,
    scheduleBreak,
    updateServiceArea,
    getStatusDisplayInfo,
    calculateAvailabilityRate,
    isWithinWorkingHours,
    estimateNextAvailableTime,
    toggleAutoUpdate,
    isConnected
  };
}