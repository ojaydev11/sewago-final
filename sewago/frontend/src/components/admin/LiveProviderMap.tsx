'use client';

import { useState, useEffect } from 'react';
import { MapPinIcon, WifiIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LiveProvider {
  id: string;
  name: string;
  phone: string;
  verified: boolean;
  tier: string;
  skills: string[];
  zones: string[];
  currentLat: number;
  currentLng: number;
  isOnline: boolean;
}

interface LiveProviderMapProps {
  className?: string;
}

export default function LiveProviderMap({ className }: LiveProviderMapProps) {
  const [liveProviders, setLiveProviders] = useState<LiveProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<LiveProvider | null>(null);

  useEffect(() => {
    fetchLiveProviders();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveProviders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveProviders = async () => {
    try {
      const response = await fetch('/api/admin/providers/live');
      if (response.ok) {
        const data = await response.json();
        setLiveProviders(data.data);
      } else {
        console.error('Failed to fetch live providers');
        // For demo purposes, use mock data
        setLiveProviders(getMockLiveProviders());
      }
    } catch (error) {
      console.error('Error fetching live providers:', error);
      // For demo purposes, use mock data
      setLiveProviders(getMockLiveProviders());
    } finally {
      setLoading(false);
    }
  };

  const getMockLiveProviders = (): LiveProvider[] => [
    {
      id: 'PROV001',
      name: 'Mike Johnson',
      phone: '+977-9800000001',
      verified: true,
      tier: 'PREMIUM',
      skills: ['Electrical', 'Plumbing'],
      zones: ['Kathmandu', 'Lalitpur'],
      currentLat: 27.7172,
      currentLng: 85.3240,
      isOnline: true
    },
    {
      id: 'PROV002',
      name: 'Sarah Davis',
      phone: '+977-9800000002',
      verified: true,
      tier: 'STANDARD',
      skills: ['Cleaning', 'Gardening'],
      zones: ['Bhaktapur'],
      currentLat: 27.6710,
      currentLng: 85.4298,
      isOnline: true
    },
    {
      id: 'PROV003',
      name: 'Alex Chen',
      phone: '+977-9800000003',
      verified: false,
      tier: 'PROVISIONAL',
      skills: ['Plumbing'],
      zones: ['Kathmandu'],
      currentLat: 27.7000,
      currentLng: 85.3333,
      isOnline: true
    }
  ];

  const getTierBadge = (tier: string) => {
    const tierConfig: Record<string, { color: string; label: string }> = {
      'PROVISIONAL': { color: 'bg-gray-100 text-gray-800', label: 'Provisional' },
      'STANDARD': { color: 'bg-blue-100 text-blue-800', label: 'Standard' },
      'PREMIUM': { color: 'bg-purple-100 text-purple-800', label: 'Premium' },
      'ELITE': { color: 'bg-yellow-100 text-yellow-800', label: 'Elite' }
    };

    const config = tierConfig[tier] || { color: 'bg-gray-100 text-gray-800', label: tier };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getMapPinColor = (tier: string) => {
    switch (tier) {
      case 'PREMIUM': return 'text-purple-600';
      case 'STANDARD': return 'text-blue-600';
      case 'ELITE': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <WifiIcon className="h-5 w-5 mr-2" />
            Live Provider Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading live providers...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <WifiIcon className="h-5 w-5 mr-2" />
            Live Provider Map
          </div>
          <Badge className="bg-green-100 text-green-800">
            {liveProviders.length} Online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Map Placeholder */}
          <div className="relative h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPinIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Interactive Map Component</p>
                <p className="text-sm">Would integrate with Mapbox/Google Maps</p>
              </div>
            </div>
            
            {/* Provider Pins */}
            {liveProviders.map((provider, index) => (
              <div
                key={provider.id}
                className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-full hover:z-10 ${
                  getMapPinColor(provider.tier)
                }`}
                style={{
                  left: `${20 + (index * 25)}%`,
                  top: `${30 + (index * 20)}%`
                }}
                onClick={() => setSelectedProvider(provider)}
              >
                <MapPinIcon className="h-6 w-6" />
                <div className="text-xs font-medium mt-1">{provider.name}</div>
              </div>
            ))}
          </div>

          {/* Live Provider List */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Online Providers</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {liveProviders.map((provider) => (
                <div
                  key={provider.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedProvider?.id === provider.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedProvider(provider)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                        <div className="text-xs text-gray-500">{provider.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTierBadge(provider.tier)}
                      {provider.verified && (
                        <ShieldCheckIcon className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                  
                  {selectedProvider?.id === provider.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Skills:</span> {provider.skills.join(', ')}
                        </div>
                        <div>
                          <span className="font-medium">Zones:</span> {provider.zones.join(', ')}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {provider.currentLat.toFixed(4)}, {provider.currentLng.toFixed(4)}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> 
                          <span className="text-green-600 ml-1">Online</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {liveProviders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <WifiIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No providers are currently online</p>
              <p className="text-sm">Providers will appear here when they go online</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
