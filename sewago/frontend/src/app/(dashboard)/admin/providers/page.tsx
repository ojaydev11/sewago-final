'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PauseIcon,
  PlayIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Provider {
  id: string;
  name: string;
  phone: string;
  verified: boolean;
  onTimePct: number;
  completionPct: number;
  yearsActive: number;
  tier: string;
  skills: string[];
  zones: string[];
  isOnline: boolean;
  currentLat?: number;
  currentLng?: number;
  createdAt: string;
}

interface ProviderFilters {
  verified: string;
  isOnline: string;
  tier: string;
  search: string;
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProviderFilters>({
    verified: '',
    isOnline: '',
    tier: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

<<<<<<< HEAD
  useEffect(() => {
    fetchProviders();
  }, [filters, pagination.page]);

  const fetchProviders = async () => {
=======
  const fetchProviders = useCallback(async () => {
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.verified && { verified: filters.verified }),
        ...(filters.isOnline && { isOnline: filters.isOnline }),
        ...(filters.tier && { tier: filters.tier }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/admin/providers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProviders(data.data.providers);
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          pages: data.data.pagination.pages
        }));
      } else {
        console.error('Failed to fetch providers');
        // For demo purposes, use mock data
        setProviders(getMockProviders());
        setPagination(prev => ({ ...prev, total: 25, pages: 2 }));
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      // For demo purposes, use mock data
      setProviders(getMockProviders());
      setPagination(prev => ({ ...prev, total: 25, pages: 2 }));
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
  };
=======
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

  const getMockProviders = (): Provider[] => [
    {
      id: 'PROV001',
      name: 'Mike Johnson',
      phone: '+977-9800000001',
      verified: true,
      onTimePct: 95,
      completionPct: 98,
      yearsActive: 3,
      tier: 'PREMIUM',
      skills: ['Electrical', 'Plumbing'],
      zones: ['Kathmandu', 'Lalitpur'],
      isOnline: true,
      currentLat: 27.7172,
      currentLng: 85.3240,
      createdAt: '2023-01-15T10:00:00Z'
    },
    {
      id: 'PROV002',
      name: 'Sarah Davis',
      phone: '+977-9800000002',
      verified: true,
      onTimePct: 92,
      completionPct: 96,
      yearsActive: 2,
      tier: 'STANDARD',
      skills: ['Cleaning', 'Gardening'],
      zones: ['Bhaktapur'],
      isOnline: false,
      createdAt: '2023-03-20T14:00:00Z'
    },
    {
      id: 'PROV003',
      name: 'Alex Chen',
      phone: '+977-9800000003',
      verified: false,
      onTimePct: 0,
      completionPct: 0,
      yearsActive: 0,
      tier: 'PROVISIONAL',
      skills: ['Plumbing'],
      zones: ['Kathmandu'],
      isOnline: false,
      createdAt: '2024-01-10T09:00:00Z'
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

  const handleFilterChange = (key: keyof ProviderFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleVerifyProvider = async (providerId: string, verified: boolean) => {
    try {
      const response = await fetch(`/api/admin/providers/${providerId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified })
      });

      if (response.ok) {
        // Update local state
        setProviders(prev => prev.map(provider => 
          provider.id === providerId 
            ? { ...provider, verified }
            : provider
        ));
      } else {
        console.error('Failed to update provider verification');
      }
    } catch (error) {
      console.error('Error updating provider verification:', error);
    }
  };

  const handleToggleProviderStatus = async (providerId: string, isOnline: boolean) => {
<<<<<<< HEAD
    try {
      const action = isOnline ? 'activate' : 'pause';
=======
    const action = isOnline ? 'activate' : 'pause';
    
    try {
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
      const response = await fetch(`/api/admin/providers/${providerId}/${action}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        // Update local state
        setProviders(prev => prev.map(provider => 
          provider.id === providerId 
            ? { ...provider, isOnline }
            : provider
        ));
      } else {
        console.error(`Failed to ${action} provider`);
      }
    } catch (error) {
      console.error(`Error ${action}ing provider:`, error);
    }
  };

  if (loading && providers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Provider Management
          </h1>
          <p className="text-gray-600">
            Manage service providers, verification, and performance
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification</label>
                <Select value={filters.verified} onValueChange={(value) => handleFilterChange('verified', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Providers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Providers</SelectItem>
                    <SelectItem value="true">Verified Only</SelectItem>
                    <SelectItem value="false">Unverified Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select value={filters.isOnline} onValueChange={(value) => handleFilterChange('isOnline', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="true">Online Only</SelectItem>
                    <SelectItem value="false">Offline Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                <Select value={filters.tier} onValueChange={(value) => handleFilterChange('tier', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Tiers</SelectItem>
                    <SelectItem value="PROVISIONAL">Provisional</SelectItem>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                    <SelectItem value="ELITE">Elite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Input
                    placeholder="Search providers..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                  <MagnifyingGlassIcon className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="flex items-end">
                <Button onClick={fetchProviders} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Providers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Providers ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills & Zones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {providers.map((provider) => (
                    <tr key={provider.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                          <div className="text-sm text-gray-500">ID: {provider.id}</div>
                          <div className="text-sm text-gray-500">{provider.yearsActive} years active</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{provider.phone}</div>
                          <div className="text-sm text-gray-500">{getTierBadge(provider.tier)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            <strong>Skills:</strong> {provider.skills.join(', ')}
                          </div>
                          <div className="text-sm text-gray-500">
                            <strong>Zones:</strong> {provider.zones.join(', ')}
                          </div>
                          {provider.currentLat && provider.currentLng && (
                            <div className="text-sm text-blue-600 flex items-center mt-1">
                              <MapPinIcon className="h-3 w-3 mr-1" />
                              Location available
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            On-time: <span className={provider.onTimePct >= 90 ? 'text-green-600' : 'text-yellow-600'}>
                              {provider.onTimePct}%
                            </span>
                          </div>
                          <div className="text-sm text-gray-900">
                            Completion: <span className={provider.completionPct >= 95 ? 'text-green-600' : 'text-yellow-600'}>
                              {provider.completionPct}%
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <div>
                            <Badge className={provider.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {provider.verified ? 'Verified' : 'Unverified'}
                            </Badge>
                          </div>
                          <div>
                            <Badge className={provider.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {provider.isOnline ? 'Online' : 'Offline'}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          
                          {!provider.verified ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleVerifyProvider(provider.id, true)}
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleVerifyProvider(provider.id, false)}
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {provider.isOnline ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleToggleProviderStatus(provider.id, false)}
                            >
                              <PauseIcon className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleToggleProviderStatus(provider.id, true)}
                            >
                              <PlayIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.page} of {pagination.pages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
