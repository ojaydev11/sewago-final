'use client';

import { useState, useEffect } from 'react';
import { 
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
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

interface BookingQueueProps {
  className?: string;
  maxBookings?: number;
}

export default function BookingQueue({ className, maxBookings = 10 }: BookingQueueProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchBookings();
    // Refresh every 60 seconds
    const interval = setInterval(fetchBookings, 60000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: '1',
        limit: maxBookings.toString(),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/bookings?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data.data.bookings);
      } else {
        console.error('Failed to fetch bookings');
        // For demo purposes, use mock data
        setBookings(getMockBookings());
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // For demo purposes, use mock data
      setBookings(getMockBookings());
    } finally {
      setLoading(false);
    }
  };

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
    },
    {
      id: 'BK004',
      status: 'EN_ROUTE',
      userId: { name: 'Alice Brown', email: 'alice@example.com', phone: '+977-9800000006' },
      serviceId: { name: 'Gardening', category: 'Landscaping', basePrice: 1200 },
      providerId: { name: 'Tom Wilson', phone: '+977-9800000007', verified: true },
      address: 'Kathmandu, Nepal',
      total: 1200,
      createdAt: '2024-01-15T07:00:00Z',
      scheduledAt: '2024-01-15T16:00:00Z'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
      'PENDING_CONFIRMATION': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: ClockIcon },
      'CONFIRMED': { color: 'bg-blue-100 text-blue-800', label: 'Confirmed', icon: CheckCircleIcon },
      'PROVIDER_ASSIGNED': { color: 'bg-purple-100 text-purple-800', label: 'Provider Assigned', icon: UserIcon },
      'EN_ROUTE': { color: 'bg-indigo-100 text-indigo-800', label: 'En Route', icon: MapPinIcon },
      'IN_PROGRESS': { color: 'bg-orange-100 text-orange-800', label: 'In Progress', icon: ClockIcon },
      'COMPLETED': { color: 'bg-green-100 text-green-800', label: 'Completed', icon: CheckCircleIcon },
      'CANCELED': { color: 'bg-red-100 text-red-800', label: 'Canceled', icon: ExclamationTriangleIcon },
      'DISPUTED': { color: 'bg-gray-100 text-gray-800', label: 'Disputed', icon: ExclamationTriangleIcon }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status, icon: ClockIcon };
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityColor = (status: string) => {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return 'border-l-4 border-l-yellow-500';
      case 'EN_ROUTE':
        return 'border-l-4 border-l-indigo-500';
      case 'IN_PROGRESS':
        return 'border-l-4 border-l-orange-500';
      default:
        return 'border-l-4 border-l-gray-300';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredBookings = bookings.filter(booking => 
    !statusFilter || booking.status === statusFilter
  );

  if (loading && bookings.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            Active Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            Active Bookings
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="PENDING_CONFIRMATION">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROVIDER_ASSIGNED">Provider Assigned</SelectItem>
                <SelectItem value="EN_ROUTE">En Route</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              </SelectContent>
            </Select>
            <Badge className="bg-blue-100 text-blue-800">
              {filteredBookings.length} Active
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No active bookings found</p>
              <p className="text-sm">All bookings are completed or canceled</p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className={`p-4 rounded-lg border ${getPriorityColor(booking.status)} bg-white hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">#{booking.id}</span>
                      {getStatusBadge(booking.status)}
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(booking.createdAt)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{booking.userId.name}</span>
                        </div>
                        <div className="text-xs text-gray-500 ml-6">
                          {booking.userId.email} • {booking.userId.phone}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPinIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{booking.serviceId.name}</span>
                        </div>
                        <div className="text-xs text-gray-500 ml-6">
                          {booking.serviceId.category} • {booking.address}
                        </div>
                      </div>
                    </div>

                    {booking.providerId && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Provider:</span>
                          <span className="text-sm font-medium text-gray-900">{booking.providerId.name}</span>
                          <Badge className={booking.providerId.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {booking.providerId.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <div className="flex items-center space-x-1">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-lg font-bold text-gray-900">₹{booking.total}</span>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      {!booking.providerId && (
                        <Button size="sm" variant="outline">
                          Assign
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {filteredBookings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button variant="outline" className="w-full">
              View All Bookings
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
