'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSocket } from '@/hooks/useSocket';
import { useLiveTracking } from '@/hooks/useLiveTracking';
import { formatDistanceToNow } from 'date-fns';
import { 
  MapPin, 
  Clock, 
  Battery, 
  Navigation, 
  Signal,
  Phone,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Car,
  User
} from 'lucide-react';

interface Provider {
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

interface LiveProviderTrackerProps {
  bookingId?: string;
  providerId?: string;
  showMap?: boolean;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export default function LiveProviderTracker({
  bookingId,
  providerId,
  showMap = true,
  showDetails = true,
  compact = false,
  className = ''
}: LiveProviderTrackerProps) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const { isConnected } = useSocket();
  const { 
    trackProvider, 
    stopTracking, 
    calculateETA, 
    getLocationAccuracy 
  } = useLiveTracking();

  // Initialize tracking
  useEffect(() => {
    if (providerId || bookingId) {
      const id = providerId || bookingId;
      if (id) {
        trackProvider(id).then((data) => {
          setProvider(data);
          setIsLoading(false);
        }).catch((err) => {
          setError(err.message);
          setIsLoading(false);
        });
      }
    }

    return () => {
      if (providerId || bookingId) {
        stopTracking(providerId || bookingId || '');
      }
    };
  }, [providerId, bookingId, trackProvider, stopTracking]);

  // Socket listeners for real-time updates
  useEffect(() => {
    const handleLocationUpdate = (data: any) => {
      if (data.providerId === providerId || data.bookingId === bookingId) {
        setProvider(prev => prev ? {
          ...prev,
          currentLat: data.latitude,
          currentLng: data.longitude,
          accuracy: data.accuracy,
          speed: data.speed,
          heading: data.heading,
          batteryLevel: data.batteryLevel,
          lastSeen: new Date().toISOString()
        } : null);

        // Update map marker if map is loaded
        if (mapInstanceRef.current && markerRef.current) {
          updateMapMarker(data.latitude, data.longitude);
        }
      }
    };

    const handleStatusUpdate = (data: any) => {
      if (data.providerId === providerId) {
        setProvider(prev => prev ? {
          ...prev,
          status: data.status,
          estimatedArrival: data.estimatedArrival,
          lastSeen: new Date().toISOString()
        } : null);
      }
    };

    if (isConnected) {
      // Subscribe to real-time updates
      const socket = (window as any).socket;
      socket.on('location_update', handleLocationUpdate);
      socket.on('provider_status_update', handleStatusUpdate);

      return () => {
        socket.off('location_update', handleLocationUpdate);
        socket.off('provider_status_update', handleStatusUpdate);
      };
    }
  }, [isConnected, providerId, bookingId]);

  // Initialize map
  useEffect(() => {
    if (showMap && provider?.currentLat && provider?.currentLng && !mapLoaded) {
      initializeMap();
    }
  }, [showMap, provider, mapLoaded]);

  const initializeMap = async () => {
    if (!mapRef.current || !provider?.currentLat || !provider?.currentLng) return;

    try {
      // Load map library (assuming Leaflet or similar)
      const L = (window as any).L;
      if (!L) {
        // Load Leaflet dynamically
        await loadMapLibrary();
      }

      const map = L.map(mapRef.current).setView(
        [provider.currentLat, provider.currentLng], 
        15
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      const marker = L.marker([provider.currentLat, provider.currentLng])
        .addTo(map)
        .bindPopup(`${provider.name} - ${getStatusText(provider.status)}`);

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setMapLoaded(true);
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  };

  const loadMapLibrary = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load map library'));
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
      document.head.appendChild(link);
    });
  };

  const updateMapMarker = (lat: number, lng: number) => {
    if (markerRef.current && mapInstanceRef.current) {
      const newLatLng = (window as any).L.latLng(lat, lng);
      markerRef.current.setLatLng(newLatLng);
      mapInstanceRef.current.panTo(newLatLng);
    }
  };

  const getStatusColor = (status: Provider['status']) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500';
      case 'EN_ROUTE': return 'bg-blue-500';
      case 'BUSY': return 'bg-yellow-500';
      case 'BREAK': return 'bg-orange-500';
      case 'EMERGENCY': return 'bg-red-500';
      case 'OFFLINE': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: Provider['status']) => {
    switch (status) {
      case 'AVAILABLE': return 'Available';
      case 'EN_ROUTE': return 'On the way';
      case 'BUSY': return 'Busy';
      case 'BREAK': return 'On break';
      case 'EMERGENCY': return 'Emergency';
      case 'OFFLINE': return 'Offline';
      default: return 'Unknown';
    }
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-400';
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAccuracyText = (accuracy?: number) => {
    if (!accuracy) return 'Unknown';
    if (accuracy <= 5) return 'Very High';
    if (accuracy <= 10) return 'High';
    if (accuracy <= 20) return 'Medium';
    return 'Low';
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !provider) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>{error || 'Provider not found'}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border ${className}`}
      >
        <div className="relative">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(provider.status)}`} />
          {provider.status === 'EN_ROUTE' && (
            <motion.div
              className="absolute inset-0 w-3 h-3 rounded-full bg-blue-400"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm">{provider.name}</div>
          <div className="text-xs text-gray-500">{getStatusText(provider.status)}</div>
        </div>
        {provider.estimatedArrival && (
          <div className="text-xs text-blue-600 font-medium">
            ETA: {provider.estimatedArrival}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{provider.name}</span>
            </div>
            <Badge variant="outline" className={`${getStatusColor(provider.status)} text-white`}>
              {getStatusText(provider.status)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status and ETA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Last seen: {formatDistanceToNow(new Date(provider.lastSeen))} ago</span>
              </div>
              {provider.estimatedArrival && (
                <div className="flex items-center space-x-2 text-sm">
                  <Navigation className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-blue-600">
                    ETA: {provider.estimatedArrival}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Signal className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Accuracy</span>
                </div>
                <span className="text-sm font-medium">
                  {getAccuracyText(provider.accuracy)}
                </span>
              </div>
              {provider.batteryLevel && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Battery className={`h-4 w-4 ${getBatteryColor(provider.batteryLevel)}`} />
                    <span className="text-sm">Battery</span>
                  </div>
                  <span className="text-sm font-medium">
                    {provider.batteryLevel}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Movement info */}
          {(provider.speed || provider.heading) && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {provider.speed && (
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-gray-500" />
                    <span>Speed: {Math.round(provider.speed)} km/h</span>
                  </div>
                )}
                {provider.heading && (
                  <div className="flex items-center space-x-2">
                    <Navigation className="h-4 w-4 text-gray-500" style={{
                      transform: `rotate(${provider.heading}deg)`
                    }} />
                    <span>Heading: {Math.round(provider.heading)}°</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Map */}
          {showMap && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Live Location</span>
              </h4>
              <div 
                ref={mapRef}
                className="h-48 rounded-lg border"
                style={{ minHeight: '200px' }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>Call</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Message</span>
            </motion.button>
          </div>

          {/* Connection status */}
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Live tracking active' : 'Reconnecting...'}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}