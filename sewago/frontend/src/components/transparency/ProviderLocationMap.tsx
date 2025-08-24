'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSocket } from '@/hooks/useSocket';
import { useLiveTracking } from '@/hooks/useLiveTracking';
import { 
  MapPin, 
  Navigation, 
  Maximize2, 
  Minimize2,
  Layers,
  Filter,
  RefreshCw,
  Users,
  Clock,
  Route
} from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'BUSY' | 'EN_ROUTE' | 'OFFLINE' | 'BREAK' | 'EMERGENCY';
  currentLat: number;
  currentLng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  lastSeen: string;
  activeBookingId?: string;
  estimatedArrival?: string;
}

interface ProviderLocationMapProps {
  providers?: Provider[];
  customerLocation?: { lat: number; lng: number };
  bookingId?: string;
  zoom?: number;
  height?: string;
  showControls?: boolean;
  showLegend?: boolean;
  showRoutes?: boolean;
  className?: string;
  onProviderSelect?: (provider: Provider) => void;
}

export default function ProviderLocationMap({
  providers = [],
  customerLocation,
  bookingId,
  zoom = 13,
  height = '400px',
  showControls = true,
  showLegend = true,
  showRoutes = false,
  className = '',
  onProviderSelect
}: ProviderLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const routesRef = useRef<Map<string, any>>(new Map());
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  const [isLoading, setIsLoading] = useState(true);

  const { isConnected } = useSocket();
  const { calculateDistance } = useLiveTracking();

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapLoaded) {
      initializeMap();
    }
  }, [mapLoaded]);

  // Update providers on map
  useEffect(() => {
    if (mapInstanceRef.current && providers.length > 0) {
      updateProviderMarkers();
    }
  }, [providers]);

  // Real-time location updates
  useEffect(() => {
    if (!isConnected) return;

    const handleLocationUpdate = (data: any) => {
      updateProviderLocation(data);
    };

    const socket = (window as any).socket;
    socket.on('location_update', handleLocationUpdate);

    return () => {
      socket.off('location_update', handleLocationUpdate);
    };
  }, [isConnected]);

  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      // Load map library
      await loadMapLibrary();
      const L = (window as any).L;

      // Determine initial center
      const center = customerLocation 
        ? [customerLocation.lat, customerLocation.lng]
        : providers.length > 0 
        ? [providers[0].currentLat, providers[0].currentLng]
        : [27.7172, 85.3240]; // Kathmandu default

      // Create map
      const map = L.map(mapRef.current).setView(center, zoom);

      // Add tile layer
      addTileLayer(map, mapStyle);

      // Add customer location marker if available
      if (customerLocation) {
        const customerIcon = L.divIcon({
          html: '<div class="customer-marker">🏠</div>',
          className: 'custom-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        L.marker([customerLocation.lat, customerLocation.lng], { icon: customerIcon })
          .addTo(map)
          .bindPopup('Your Location')
          .openPopup();
      }

      mapInstanceRef.current = map;
      setMapLoaded(true);
      setIsLoading(false);

      // Update providers
      if (providers.length > 0) {
        updateProviderMarkers();
      }
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setIsLoading(false);
    }
  };

  const loadMapLibrary = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).L) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load map library'));
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
      document.head.appendChild(link);

      // Add custom styles
      const customStyles = document.createElement('style');
      customStyles.textContent = `
        .custom-marker {
          background: white;
          border-radius: 50%;
          border: 2px solid #333;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .provider-marker {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
        }
        .provider-marker.available { background: #10b981; }
        .provider-marker.busy { background: #f59e0b; }
        .provider-marker.en-route { background: #3b82f6; }
        .provider-marker.offline { background: #6b7280; }
        .provider-marker.break { background: #f97316; }
        .provider-marker.emergency { background: #ef4444; }
        .provider-marker::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .customer-marker {
          font-size: 20px;
        }
        .route-line {
          color: #3b82f6;
          weight: 4;
          opacity: 0.7;
        }
      `;
      document.head.appendChild(customStyles);
    });
  };

  const addTileLayer = (map: any, style: string) => {
    const L = (window as any).L;
    
    // Remove existing layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl: string;
    let attribution = '© OpenStreetMap contributors';

    switch (style) {
      case 'satellite':
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        attribution = '© Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community';
        break;
      case 'terrain':
        tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        attribution = '© OpenTopoMap (CC-BY-SA)';
        break;
      default:
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    L.tileLayer(tileUrl, { attribution }).addTo(map);
  };

  const updateProviderMarkers = () => {
    const map = mapInstanceRef.current;
    const L = (window as any).L;
    if (!map || !L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current.clear();

    // Add new markers
    providers.forEach(provider => {
      const statusClass = provider.status.toLowerCase().replace('_', '-');
      
      const icon = L.divIcon({
        html: `<div class="provider-marker ${statusClass}">${provider.name.charAt(0)}</div>`,
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([provider.currentLat, provider.currentLng], { icon })
        .addTo(map)
        .bindPopup(createProviderPopup(provider));

      // Add click handler
      marker.on('click', () => {
        setSelectedProvider(provider);
        onProviderSelect?.(provider);
      });

      markersRef.current.set(provider.id, marker);

      // Add route if requested and customer location is available
      if (showRoutes && customerLocation) {
        addProviderRoute(provider);
      }
    });

    // Fit map to show all markers
    if (providers.length > 0) {
      const group = new L.featureGroup(Array.from(markersRef.current.values()));
      map.fitBounds(group.getBounds().pad(0.1));
    }
  };

  const updateProviderLocation = (data: any) => {
    const marker = markersRef.current.get(data.providerId);
    if (marker) {
      const L = (window as any).L;
      const newLatLng = L.latLng(data.latitude, data.longitude);
      marker.setLatLng(newLatLng);

      // Update route if showing routes
      if (showRoutes && customerLocation) {
        const provider = providers.find(p => p.id === data.providerId);
        if (provider) {
          const updatedProvider = { ...provider, currentLat: data.latitude, currentLng: data.longitude };
          addProviderRoute(updatedProvider);
        }
      }
    }
  };

  const addProviderRoute = async (provider: Provider) => {
    if (!customerLocation || !mapInstanceRef.current) return;

    const L = (window as any).L;
    const routeId = `route-${provider.id}`;

    // Remove existing route
    const existingRoute = routesRef.current.get(routeId);
    if (existingRoute) {
      mapInstanceRef.current.removeLayer(existingRoute);
    }

    try {
      // Simple straight line route for now
      const coordinates = [
        [provider.currentLat, provider.currentLng],
        [customerLocation.lat, customerLocation.lng]
      ];

      const routeLine = L.polyline(coordinates, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7,
        dashArray: provider.status === 'EN_ROUTE' ? '10, 5' : undefined
      }).addTo(mapInstanceRef.current);

      routesRef.current.set(routeId, routeLine);

      // Calculate straight-line distance and estimate time
      const distance = calculateDistance(
        provider.currentLat, provider.currentLng,
        customerLocation.lat, customerLocation.lng
      );
      
      const estimatedTime = Math.round(distance * 2); // Rough estimate: 2 minutes per km
      
      // Add ETA popup at midpoint
      const midpointLat = (provider.currentLat + customerLocation.lat) / 2;
      const midpointLng = (provider.currentLng + customerLocation.lng) / 2;
      
      L.popup()
        .setLatLng([midpointLat, midpointLng])
        .setContent(`Distance: ${distance.toFixed(1)}km<br>EST: ${estimatedTime} min`)
        .openOn(mapInstanceRef.current);
    } catch (error) {
      console.error('Failed to add route:', error);
    }
  };

  const createProviderPopup = (provider: Provider) => {
    const statusColors = {
      AVAILABLE: '#10b981',
      BUSY: '#f59e0b',
      EN_ROUTE: '#3b82f6',
      OFFLINE: '#6b7280',
      BREAK: '#f97316',
      EMERGENCY: '#ef4444'
    };

    return `
      <div class="p-2 min-w-[200px]">
        <div class="flex items-center space-x-2 mb-2">
          <div class="w-3 h-3 rounded-full" style="background: ${statusColors[provider.status]}"></div>
          <h3 class="font-semibold">${provider.name}</h3>
        </div>
        <div class="space-y-1 text-sm">
          <div>Status: ${provider.status.replace('_', ' ')}</div>
          ${provider.speed ? `<div>Speed: ${Math.round(provider.speed)} km/h</div>` : ''}
          ${provider.estimatedArrival ? `<div>ETA: ${provider.estimatedArrival}</div>` : ''}
          <div class="text-xs text-gray-500">
            Last seen: ${new Date(provider.lastSeen).toLocaleTimeString()}
          </div>
        </div>
      </div>
    `;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);
  };

  const changeMapStyle = (style: 'streets' | 'satellite' | 'terrain') => {
    setMapStyle(style);
    if (mapInstanceRef.current) {
      addTileLayer(mapInstanceRef.current, style);
    }
  };

  const refreshMap = () => {
    if (mapInstanceRef.current) {
      updateProviderMarkers();
    }
  };

  const getStatusStats = () => {
    const stats = providers.reduce((acc, provider) => {
      acc[provider.status] = (acc[provider.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''} ${className}`}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Provider Locations</span>
              <Badge variant="outline">{providers.length} providers</Badge>
            </CardTitle>
            
            {showControls && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshMap}
                  className="p-2"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={mapStyle === 'streets' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => changeMapStyle('streets')}
                    className="px-2 py-1 text-xs"
                  >
                    Streets
                  </Button>
                  <Button
                    variant={mapStyle === 'satellite' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => changeMapStyle('satellite')}
                    className="px-2 py-1 text-xs"
                  >
                    Satellite
                  </Button>
                  <Button
                    variant={mapStyle === 'terrain' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => changeMapStyle('terrain')}
                    className="px-2 py-1 text-xs"
                  >
                    Terrain
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="p-2"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0 relative">
          <div 
            ref={mapRef}
            style={{ height: isFullscreen ? 'calc(100vh - 120px)' : height }}
            className="w-full rounded-b-lg"
          />
          
          {showLegend && (
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
              <h4 className="font-semibold text-sm mb-2">Provider Status</h4>
              <div className="space-y-1 text-xs">
                {Object.entries(getStatusStats()).map(([status, count]) => (
                  <div key={status} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full provider-marker ${status.toLowerCase().replace('_', '-')}`} />
                    <span>{status.replace('_', ' ')}</span>
                    <span className="text-gray-500">({count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!isConnected && (
            <div className="absolute bottom-4 left-4 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>Reconnecting to live updates...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}