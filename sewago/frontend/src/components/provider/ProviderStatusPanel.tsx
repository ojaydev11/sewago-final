'use client';

import { useState, useEffect } from 'react';
import { 
  WifiIcon, 
  MapPinIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSocket } from '@/hooks/useSocket';

interface ProviderStatusPanelProps {
  className?: string;
}

export default function ProviderStatusPanel({ className }: ProviderStatusPanelProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    // Get current location on component mount
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (socket && isConnected) {
      // Listen for status update confirmations
      socket.on('statusUpdateConfirmed', (data) => {
        console.log('Status update confirmed:', data);
        setLastUpdate(new Date());
        setIsUpdating(false);
      });

      socket.on('locationUpdateConfirmed', (data) => {
        console.log('Location update confirmed:', data);
        setLastUpdate(new Date());
        setIsUpdating(false);
        setLocationError(null);
      });

      socket.on('updateError', (error) => {
        console.error('Update error:', error);
        setIsUpdating(false);
        setLocationError(error.message || 'Failed to update');
      });

      return () => {
        socket.off('statusUpdateConfirmed');
        socket.off('locationUpdateConfirmed');
        socket.off('updateError');
      };
    }
  }, [socket, isConnected]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationError('Unable to get current location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleStatusToggle = async () => {
    if (!socket || !isConnected) {
      setLocationError('Not connected to server');
      return;
    }

    setIsUpdating(true);
    const newStatus = !isOnline;

    try {
      // Update status via WebSocket
      socket.emit('providerStatusUpdate', {
        providerId: 'current-provider-id', // This should come from auth context
        isOnline: newStatus
      });

      // Also update via REST API for redundancy
      const response = await fetch('/api/provider/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: newStatus })
      });

      if (response.ok) {
        setIsOnline(newStatus);
        setLastUpdate(new Date());
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setLocationError('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLocationUpdate = async () => {
    if (!socket || !isConnected) {
      setLocationError('Not connected to server');
      return;
    }

    if (location.lat === 0 && location.lng === 0) {
      setLocationError('Please get your current location first');
      return;
    }

    setIsUpdating(true);

    try {
      // Update location via WebSocket
      socket.emit('providerLocationUpdate', {
        providerId: 'current-provider-id', // This should come from auth context
        lat: location.lat,
        lng: location.lng,
        isOnline: isOnline
      });

      // Also update via REST API for redundancy
      const response = await fetch('/api/provider/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          isOnline: isOnline
        })
      });

      if (response.ok) {
        setLastUpdate(new Date());
        setLocationError(null);
      } else {
        throw new Error('Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      setLocationError('Failed to update location');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = () => {
    if (isOnline) {
      return <Badge className="bg-green-100 text-green-800">Online</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">Offline</Badge>;
  };

  const getConnectionStatus = () => {
    if (isConnected) {
      return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">Disconnected</Badge>;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <WifiIcon className="h-5 w-5 mr-2" />
            Provider Status
          </span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Server Connection</span>
          {getConnectionStatus()}
        </div>

        {/* Online/Offline Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="online-toggle" className="text-sm font-medium">
              Go Online
            </Label>
            <p className="text-xs text-gray-500">
              {isOnline ? 'You are currently accepting bookings' : 'You are currently offline'}
            </p>
          </div>
          <Switch
            id="online-toggle"
            checked={isOnline}
            onCheckedChange={handleStatusToggle}
            disabled={isUpdating || !isConnected}
          />
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Current Location</span>
            <Button
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={isUpdating}
            >
              <MapPinIcon className="h-4 w-4 mr-2" />
              Get Location
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude" className="text-xs text-gray-500">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={location.lat.toFixed(6)}
                onChange={(e) => setLocation(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                placeholder="0.000000"
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="longitude" className="text-xs text-gray-500">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={location.lng.toFixed(6)}
                onChange={(e) => setLocation(prev => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))}
                placeholder="0.000000"
                className="text-sm"
              />
            </div>
          </div>

          {locationError && (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <XCircleIcon className="h-4 w-4" />
              <span>{locationError}</span>
            </div>
          )}

          <Button
            onClick={handleLocationUpdate}
            disabled={isUpdating || !isConnected || (location.lat === 0 && location.lng === 0)}
            className="w-full"
          >
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <MapPinIcon className="h-4 w-4 mr-2" />
                Update Location
              </>
            )}
          </Button>
        </div>

        {/* Last Update Info */}
        {lastUpdate && (
          <div className="flex items-center space-x-2 text-xs text-gray-500 pt-4 border-t">
            <ClockIcon className="h-3 w-3" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}

        {/* Status Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Status Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500">Connection:</span>
              <span className={`ml-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Availability:</span>
              <span className={`ml-2 ${isOnline ? 'text-green-600' : 'text-gray-600'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Location:</span>
              <span className={`ml-2 ${location.lat !== 0 && location.lng !== 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {location.lat !== 0 && location.lng !== 0 ? 'Set' : 'Not set'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Updates:</span>
              <span className="ml-2 text-gray-600">
                {isUpdating ? 'In progress' : 'Ready'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
