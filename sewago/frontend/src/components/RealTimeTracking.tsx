'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io, Socket } from 'socket.io-client';
import { MapPinIcon, ClockIcon, CheckCircleIcon, TruckIcon } from '@heroicons/react/24/outline';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  lat: number;
  lng: number;
  timestamp: Date;
}

interface StatusUpdate {
  status: 'assigned' | 'on_the_way' | 'arrived' | 'in_progress' | 'completed';
  timestamp: Date;
  message: string;
}

interface RealTimeTrackingProps {
  bookingId: string;
  providerId: string;
  customerLocation: { lat: number; lng: number };
  initialProviderLocation?: Location;
}

// Component to update map view when provider location changes
function MapUpdater({ providerLocation }: { providerLocation: Location }) {
  const map = useMap();
  
  useEffect(() => {
    if (providerLocation) {
      map.setView([providerLocation.lat, providerLocation.lng], 15);
    }
  }, [providerLocation, map]);

  return null;
}

// Status Timeline Component
function StatusTimeline({ statusUpdates }: { statusUpdates: StatusUpdate[] }) {
  const getStatusIcon = (status: StatusUpdate['status']) => {
    switch (status) {
      case 'assigned':
        return <MapPinIcon className="w-5 h-5 text-blue-500" />;
      case 'on_the_way':
        return <TruckIcon className="w-5 h-5 text-yellow-500" />;
      case 'arrived':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <ClockIcon className="w-5 h-5 text-purple-500" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: StatusUpdate['status']) => {
    switch (status) {
      case 'assigned':
        return 'border-blue-500 bg-blue-50';
      case 'on_the_way':
        return 'border-yellow-500 bg-yellow-50';
      case 'arrived':
        return 'border-green-500 bg-green-50';
      case 'in_progress':
        return 'border-purple-500 bg-purple-50';
      case 'completed':
        return 'border-green-600 bg-green-100';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Job Status Timeline</h3>
      <div className="space-y-3">
        {statusUpdates.map((update, index) => (
          <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg border-l-4 ${getStatusColor(update.status)}`}>
            <div className="flex-shrink-0">
              {getStatusIcon(update.status)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800 capitalize">
                {update.status.replace('_', ' ')}
              </p>
              <p className="text-sm text-gray-600">{update.message}</p>
              <p className="text-xs text-gray-500">
                {update.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RealTimeTracking({
  bookingId,
  providerId,
  customerLocation,
  initialProviderLocation
}: RealTimeTrackingProps) {
  const [providerLocation, setProviderLocation] = useState<Location | null>(initialProviderLocation || null);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([
    {
      status: 'assigned',
      timestamp: new Date(),
      message: 'Provider has been assigned to your booking'
    }
  ]);
  const [eta, setEta] = useState<string>('Calculating...');
  const [socket, setSocket] = useState<Socket | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001', {
      query: { bookingId, providerId }
    });

    newSocket.on('connect', () => {
      console.log('Connected to tracking socket');
    });

    newSocket.on('providerLocationUpdate', (data: Location) => {
      setProviderLocation(data);
      calculateETA(data);
    });

    newSocket.on('statusUpdate', (data: StatusUpdate) => {
      setStatusUpdates(prev => [...prev, data]);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from tracking socket');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [bookingId, providerId]);

  const calculateETA = (location: Location) => {
    if (!customerLocation) return;
    
    // Simple distance calculation (in a real app, you'd use a routing service)
    const distance = Math.sqrt(
      Math.pow(location.lat - customerLocation.lat, 2) + 
      Math.pow(location.lng - customerLocation.lng, 2)
    ) * 111; // Rough conversion to km
    
    // Assume average speed of 30 km/h for urban areas
    const estimatedTimeMinutes = Math.round((distance / 30) * 60);
    
    if (estimatedTimeMinutes < 1) {
      setEta('Less than 1 minute');
    } else if (estimatedTimeMinutes < 60) {
      setEta(`${estimatedTimeMinutes} minutes`);
    } else {
      const hours = Math.floor(estimatedTimeMinutes / 60);
      const minutes = estimatedTimeMinutes % 60;
      setEta(`${hours}h ${minutes}m`);
    }
  };

  const center = providerLocation || customerLocation;

  return (
    <div className="space-y-6">
      {/* ETA Display */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Estimated Arrival Time</h2>
        <p className="text-3xl font-bold">{eta}</p>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Live Tracking Map</h3>
        </div>
        <div className="h-96 w-full">
          <MapContainer
            center={[center.lat, center.lng]}
            zoom={15}
            className="h-full w-full"
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Customer Location Marker */}
            <Marker position={[customerLocation.lat, customerLocation.lng]}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Your Location</p>
                  <p className="text-sm text-gray-600">Service requested here</p>
                </div>
              </Popup>
            </Marker>

            {/* Provider Location Marker */}
            {providerLocation && (
              <Marker 
                position={[providerLocation.lat, providerLocation.lng]}
                icon={new L.Icon({
                  iconUrl: '/icons/provider-marker.svg',
                  iconSize: [32, 32],
                  iconAnchor: [16, 32],
                  popupAnchor: [0, -32]
                })}
              >
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold">Service Provider</p>
                    <p className="text-sm text-gray-600">
                      Last updated: {providerLocation.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Update map view when provider location changes */}
            {providerLocation && <MapUpdater providerLocation={providerLocation} />}
          </MapContainer>
        </div>
      </div>

      {/* Status Timeline */}
      <StatusTimeline statusUpdates={statusUpdates} />

      {/* Connection Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${socket?.connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {socket?.connected ? 'Live tracking active' : 'Connecting...'}
          </span>
        </div>
      </div>
    </div>
  );
}
