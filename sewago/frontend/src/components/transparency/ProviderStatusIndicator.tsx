'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSocket } from '@/hooks/useSocket';
import { formatDistanceToNow } from 'date-fns';
import { 
  Circle, 
  Clock, 
  Users, 
  MapPin, 
  Battery, 
  Wifi,
  AlertTriangle,
  CheckCircle,
  Pause,
  Navigation
} from 'lucide-react';

interface ProviderStatusData {
  id: string;
  status: 'AVAILABLE' | 'BUSY' | 'EN_ROUTE' | 'OFFLINE' | 'BREAK' | 'EMERGENCY' | 'UNAVAILABLE';
  currentCapacity: number;
  maxCapacity: number;
  isAvailable: boolean;
  estimatedAvailableAt?: string;
  currentBookingId?: string;
  activeBookings: string[];
  lastStatusUpdate: string;
  currentServiceArea?: {
    name: string;
    coordinates: number[][];
  };
  batteryLevel?: number;
  isOnline: boolean;
}

interface ProviderStatusIndicatorProps {
  providerId: string;
  variant?: 'default' | 'compact' | 'detailed';
  showCapacity?: boolean;
  showLocation?: boolean;
  showBattery?: boolean;
  className?: string;
  onStatusChange?: (status: ProviderStatusData) => void;
}

export default function ProviderStatusIndicator({
  providerId,
  variant = 'default',
  showCapacity = true,
  showLocation = false,
  showBattery = false,
  className = '',
  onStatusChange
}: ProviderStatusIndicatorProps) {
  const [status, setStatus] = useState<ProviderStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isConnected } = useSocket();

  // Fetch initial status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/providers/${providerId}/status`);
        if (!response.ok) throw new Error('Failed to fetch provider status');
        
        const data = await response.json();
        setStatus(data);
        onStatusChange?.(data);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [providerId, onStatusChange]);

  // Real-time status updates
  useEffect(() => {
    if (!isConnected) return;

    const handleStatusUpdate = (data: any) => {
      if (data.providerId === providerId) {
        setStatus(prev => ({
          ...prev!,
          ...data,
          lastStatusUpdate: new Date().toISOString()
        }));
        onStatusChange?.(data);
      }
    };

    const socket = (window as any).socket;
    socket.on('provider_status_update', handleStatusUpdate);

    return () => {
      socket.off('provider_status_update', handleStatusUpdate);
    };
  }, [isConnected, providerId, onStatusChange]);

  const getStatusConfig = (statusType: ProviderStatusData['status']) => {
    switch (statusType) {
      case 'AVAILABLE':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          icon: CheckCircle,
          label: 'Available',
          description: 'Ready to accept bookings'
        };
      case 'BUSY':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          icon: Users,
          label: 'Busy',
          description: 'Currently serving customers'
        };
      case 'EN_ROUTE':
        return {
          color: 'bg-blue-500',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50',
          icon: Navigation,
          label: 'En Route',
          description: 'On the way to customer'
        };
      case 'BREAK':
        return {
          color: 'bg-orange-500',
          textColor: 'text-orange-700',
          bgColor: 'bg-orange-50',
          icon: Pause,
          label: 'On Break',
          description: 'Taking a break'
        };
      case 'EMERGENCY':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          icon: AlertTriangle,
          label: 'Emergency',
          description: 'Emergency situation'
        };
      case 'OFFLINE':
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          icon: Circle,
          label: 'Offline',
          description: 'Not available'
        };
      case 'UNAVAILABLE':
        return {
          color: 'bg-gray-400',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: Circle,
          label: 'Unavailable',
          description: 'Temporarily unavailable'
        };
      default:
        return {
          color: 'bg-gray-400',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: Circle,
          label: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const calculateCapacityPercentage = () => {
    if (!status || status.maxCapacity === 0) return 0;
    return (status.currentCapacity / status.maxCapacity) * 100;
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-400';
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        {variant === 'compact' ? (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        {error || 'Status unavailable'}
      </div>
    );
  }

  const statusConfig = getStatusConfig(status.status);
  const Icon = statusConfig.icon;

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex items-center space-x-2 ${className}`}
      >
        <div className="relative">
          <motion.div
            className={`w-3 h-3 rounded-full ${statusConfig.color}`}
            animate={status.status === 'EN_ROUTE' ? { scale: [1, 1.3, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          {!status.isOnline && (
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-gray-500 opacity-50" />
          )}
        </div>
        <span className={`text-sm font-medium ${statusConfig.textColor}`}>
          {statusConfig.label}
        </span>
        {showCapacity && status.maxCapacity > 1 && (
          <span className="text-xs text-gray-500">
            ({status.currentCapacity}/{status.maxCapacity})
          </span>
        )}
      </motion.div>
    );
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={className}
      >
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Main status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <motion.div
                      className={`w-4 h-4 rounded-full ${statusConfig.color}`}
                      animate={status.status === 'EN_ROUTE' ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                    {!status.isOnline && (
                      <motion.div
                        className="absolute inset-0 w-4 h-4 rounded-full bg-gray-500 opacity-50"
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${statusConfig.textColor}`}>
                      {statusConfig.label}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {statusConfig.description}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={statusConfig.bgColor}>
                  <Icon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>

              {/* Capacity */}
              {showCapacity && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current Capacity</span>
                    <span className="font-medium">
                      {status.currentCapacity}/{status.maxCapacity}
                    </span>
                  </div>
                  <Progress 
                    value={calculateCapacityPercentage()} 
                    className="h-2"
                  />
                </div>
              )}

              {/* Location info */}
              {showLocation && status.currentServiceArea && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Service Area:</span>
                  <span className="font-medium">{status.currentServiceArea.name}</span>
                </div>
              )}

              {/* Battery and connection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Wifi className={`h-4 w-4 ${status.isOnline ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm">
                    {status.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                {showBattery && status.batteryLevel && (
                  <div className="flex items-center space-x-2">
                    <Battery className={`h-4 w-4 ${getBatteryColor(status.batteryLevel)}`} />
                    <span className="text-sm">{status.batteryLevel}%</span>
                  </div>
                )}
              </div>

              {/* Last update */}
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>
                  Updated {formatDistanceToNow(new Date(status.lastStatusUpdate))} ago
                </span>
              </div>

              {/* Estimated availability */}
              {status.estimatedAvailableAt && status.status !== 'AVAILABLE' && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-blue-700">
                    <Clock className="h-4 w-4" />
                    <span>Expected to be available at {status.estimatedAvailableAt}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center space-x-3 ${className}`}
    >
      <div className="relative">
        <motion.div
          className={`w-4 h-4 rounded-full ${statusConfig.color}`}
          animate={status.status === 'EN_ROUTE' ? { scale: [1, 1.3, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        {!status.isOnline && (
          <motion.div
            className="absolute inset-0 w-4 h-4 rounded-full bg-gray-500 opacity-50"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </div>
      <div className="flex-1">
        <div className={`font-medium ${statusConfig.textColor}`}>
          {statusConfig.label}
        </div>
        {showCapacity && (
          <div className="text-sm text-gray-500">
            Capacity: {status.currentCapacity}/{status.maxCapacity}
          </div>
        )}
      </div>
      {status.estimatedAvailableAt && status.status !== 'AVAILABLE' && (
        <div className="text-xs text-blue-600">
          Available at {status.estimatedAvailableAt}
        </div>
      )}
    </motion.div>
  );
}