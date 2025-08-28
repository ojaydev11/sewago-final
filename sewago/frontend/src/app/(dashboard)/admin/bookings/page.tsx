'use client';

// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Booking {
  id: string;
  status: string;
  userId: {
    name: string;
    email: string;
    phone: string;
  };
  serviceId: {
    name: string;
    category: string;
    basePrice: number;
  };
  providerId?: {
    name: string;
    phone: string;
    verified: boolean;
  };
  address: string;
  total: number;
  createdAt: string;
  scheduledAt?: string;
}

interface BookingFilters {
  status: string;
  providerId: string;
  startDate: string;
  endDate: string;
  search: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BookingFilters>({
    status: '',
    providerId: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.providerId && { providerId: filters.providerId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/admin/bookings?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data.data.bookings);
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          pages: data.data.pagination.pages
        }));
      } else {
        console.error('Failed to fetch bookings');
        // For demo purposes, use mock data
        setBookings(getMockBookings());
        setPagination(prev => ({ ...prev, total: 50, pages: 3 }));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // For demo purposes, use mock data
      setBookings(getMockBookings());
      setPagination(prev => ({ ...prev, total: 50, pages: 3 }));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const getMockBookings = (): Booking[] => [
    {
      id: 'BK001',
      status: 'PENDING_CONFIRMATION',
      userId: { name: 'John Doe', email: 'john@example.com', phone: '+977-9800000001' },
      serviceId: { name: 'House Cleaning', category: 'Cleaning', basePrice: 1500 },
      address: 'Kathmandu, Nepal',
      total: 1500,
      createdAt: '2024-01-15T10:00:00Z',
      scheduledAt: '2024-01-16T14:00:00Z'
    },
    {
      id: 'BK002',
      status: 'PROVIDER_ASSIGNED',
      userId: { name: 'Jane Smith', email: 'jane@example.com', phone: '+977-9800000002' },
      serviceId: { name: 'Electrical Work', category: 'Electrical', basePrice: 2000 },
      providerId: { name: 'Mike Johnson', phone: '+977-9800000003', verified: true },
      address: 'Lalitpur, Nepal',
      total: 2000,
      createdAt: '2024-01-15T09:00:00Z',
      scheduledAt: '2024-01-16T10:00:00Z'
    },
    {
      id: 'BK003',
      status: 'IN_PROGRESS',
      userId: { name: 'Bob Wilson', email: 'bob@example.com', phone: '+977-9800000004' },
      serviceId: { name: 'Plumbing', category: 'Plumbing', basePrice: 1800 },
      providerId: { name: 'Sarah Davis', phone: '+977-9800000005', verified: true },
      address: 'Bhaktapur, Nepal',
      total: 1800,
      createdAt: '2024-01-15T08:00:00Z',
      scheduledAt: '2024-01-15T15:00:00Z'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      'PENDING_CONFIRMATION': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'CONFIRMED': { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      'PROVIDER_ASSIGNED': { color: 'bg-purple-100 text-purple-800', label: 'Provider Assigned' },
      'EN_ROUTE': { color: 'bg-indigo-100 text-indigo-800', label: 'En Route' },
      'IN_PROGRESS': { color: 'bg-orange-100 text-orange-800', label: 'In Progress' },
      'COMPLETED': { color: 'bg-green-100 text-green-800', label: 'Completed' },
      'CANCELED': { color: 'bg-red-100 text-red-800', label: 'Canceled' },
      'DISPUTED': { color: 'bg-gray-100 text-gray-800', label: 'Disputed' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleFilterChange = (key: keyof BookingFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
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
            Booking Management
          </h1>
          <p className="text-gray-600">
            Manage and monitor all service bookings
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="PENDING_CONFIRMATION">Pending Confirmation</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROVIDER_ASSIGNED">Provider Assigned</SelectItem>
                    <SelectItem value="EN_ROUTE">En Route</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELED">Canceled</SelectItem>
                    <SelectItem value="DISPUTED">Disputed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Input
                    placeholder="Search bookings..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                  <MagnifyingGlassIcon className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="flex items-end">
                <Button onClick={fetchBookings} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.userId.name}</div>
                          <div className="text-sm text-gray-500">{booking.userId.email}</div>
                          <div className="text-sm text-gray-500">{booking.userId.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.serviceId.name}</div>
                          <div className="text-sm text-gray-500">{booking.serviceId.category}</div>
                          <div className="text-sm text-gray-500">₹{booking.serviceId.basePrice}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {booking.providerId ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.providerId.name}</div>
                            <div className="text-sm text-gray-500">{booking.providerId.phone}</div>
                            <Badge className={booking.providerId.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {booking.providerId.verified ? 'Verified' : 'Pending'}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{booking.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          {!booking.providerId && (
                            <Button size="sm" variant="outline">
                              <UserPlusIcon className="h-4 w-4" />
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
