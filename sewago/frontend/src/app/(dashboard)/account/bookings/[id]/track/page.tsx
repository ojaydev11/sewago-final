'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
import { useParams } from 'next/navigation';
import { 
  MapPinIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSocket } from '@/hooks/useSocket';

interface Booking {
  id: string;
  status: string;
  serviceId: {
    name: string;
    category: string;
    basePrice: number;
  };
  providerId?: {
    name: string;
    phone: string;
    verified: boolean;
    currentLat?: number;
    currentLng?: number;
    isOnline: boolean;
  };
  address: string;
  total: number;
  createdAt: string;
  scheduledAt?: string;
  notes?: string;
}

interface TrackingUpdate {
  type: 'status' | 'location' | 'eta';
  data: any;
  timestamp: Date;
}

export default function BookingTrackPage() {
  const params = useParams();
<<<<<<< HEAD
  const bookingId = params.id as string;
  
=======
  
  // All hooks must be called unconditionally at the top level
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingUpdates, setTrackingUpdates] = useState<TrackingUpdate[]>([]);
  const [eta, setEta] = useState<string>('Calculating...');
  
  const { socket, isConnected } = useSocket();

<<<<<<< HEAD
  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    if (socket && isConnected) {
=======
  // Get bookingId safely - will be undefined if params.id doesn't exist
  const bookingId = typeof params?.id === 'string' ? params.id : undefined;

  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;
    
    try {
      setLoading(true);
      // Mock API call - replace with actual backend integration
      const mockBooking: Booking = {
        id: bookingId,
        status: 'IN_PROGRESS',
        serviceId: {
          name: 'House Cleaning',
          category: 'Cleaning',
          basePrice: 1500
        },
        providerId: {
          name: 'John Doe',
          phone: '+977-9800000001',
          verified: true,
          currentLat: 27.7172,
          currentLng: 85.3240,
          isOnline: true
        },
        address: 'Thamel, Kathmandu',
        total: 1500,
        createdAt: new Date().toISOString(),
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        notes: 'Deep cleaning required'
      };
      
      setBooking(mockBooking);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [fetchBooking, bookingId]);

  useEffect(() => {
    if (socket && isConnected && bookingId) {
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
      // Join the booking room for real-time updates
      socket.emit('joinBookingRoom', { 
        bookingId, 
        userId: 'current-user-id' // This should come from auth context
      });

      // Listen for booking status updates
      socket.on('bookingStatusUpdated', (data) => {
        console.log('Booking status updated:', data);
        setTrackingUpdates(prev => [{
          type: 'status',
          data,
          timestamp: new Date()
        }, ...prev.slice(0, 9)]);
        
        // Update local booking status
        if (booking) {
          setBooking(prev => prev ? { ...prev, status: data.status } : null);
        }
      });

      // Listen for provider location updates
      socket.on('providerLocationUpdated', (data) => {
        console.log('Provider location updated:', data);
        setTrackingUpdates(prev => [{
          type: 'location',
          data,
          timestamp: new Date()
        }, ...prev.slice(0, 9)]);
        
        // Update local provider location
        if (booking?.providerId) {
          setBooking(prev => prev ? {
            ...prev,
            providerId: {
              ...prev.providerId!,
              currentLat: data.lat,
              currentLng: data.lng,
              isOnline: data.isOnline
            }
          } : null);
        }
      });

      // Listen for provider status updates
      socket.on('providerStatusUpdated', (data) => {
        console.log('Provider status updated:', data);
        setTrackingUpdates(prev => [{
          type: 'status',
          data,
          timestamp: new Date()
        }, ...prev.slice(0, 9)]);
        
        // Update local provider status
        if (booking?.providerId) {
          setBooking(prev => prev ? {
            ...prev,
            providerId: {
              ...prev.providerId!,
              isOnline: data.isOnline
            }
          } : null);
        }
      });

      // Listen for errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      return () => {
        socket.off('bookingStatusUpdated');
        socket.off('providerLocationUpdated');
        socket.off('providerStatusUpdated');
        socket.off('error');
      };
    }
  }, [socket, isConnected, bookingId, booking]);

<<<<<<< HEAD
  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data.data);
        
        // Get ETA if provider is assigned
        if (data.data.providerId) {
          fetchETA(bookingId);
        }
      } else {
        console.error('Failed to fetch booking');
        // For demo purposes, use mock data
        setBooking(getMockBooking());
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      // For demo purposes, use mock data
      setBooking(getMockBooking());
    } finally {
      setLoading(false);
    }
  };

=======
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
  const fetchETA = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/tracking/${bookingId}/eta`);
      if (response.ok) {
        const data = await response.json();
        setEta(data.data.eta || 'Calculating...');
      }
    } catch (error) {
      console.error('Error fetching ETA:', error);
      setEta('Unable to calculate');
    }
  };

  const getMockBooking = (): Booking => ({
    id: 'BK001',
    status: 'EN_ROUTE',
    serviceId: {
      name: 'House Cleaning',
      category: 'Cleaning',
      basePrice: 1500
    },
    providerId: {
      name: 'Mike Johnson',
      phone: '+977-9800000001',
      verified: true,
      currentLat: 27.7172,
      currentLng: 85.3240,
      isOnline: true
    },
    address: 'Kathmandu, Nepal',
    total: 1500,
    createdAt: '2024-01-15T10:00:00Z',
    scheduledAt: '2024-01-16T14:00:00Z',
    notes: 'Please clean the kitchen thoroughly'
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
      'PENDING_CONFIRMATION': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Confirmation', icon: ClockIcon },
      'CONFIRMED': { color: 'bg-blue-100 text-blue-800', label: 'Confirmed', icon: CheckCircleIcon },
      'PROVIDER_ASSIGNED': { color: 'bg-purple-100 text-purple-800', label: 'Provider Assigned', icon: UserIcon },
      'EN_ROUTE': { color: 'bg-indigo-100 text-indigo-800', label: 'Provider En Route', icon: TruckIcon },
      'IN_PROGRESS': { color: 'bg-orange-100 text-orange-800', label: 'Service In Progress', icon: WrenchScrewdriverIcon },
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

  const getStatusStep = (status: string) => {
    const steps = [
      'PENDING_CONFIRMATION',
      'CONFIRMED', 
      'PROVIDER_ASSIGNED',
      'EN_ROUTE',
      'IN_PROGRESS',
      'COMPLETED'
    ];
    return steps.indexOf(status) + 1;
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return 'We are reviewing your booking request and will confirm shortly.';
      case 'CONFIRMED':
        return 'Your booking has been confirmed! We are finding the best provider for you.';
      case 'PROVIDER_ASSIGNED':
        return 'Great news! A provider has been assigned to your service.';
      case 'EN_ROUTE':
        return 'Your provider is on the way! You can track their location in real-time.';
      case 'IN_PROGRESS':
        return 'Your service is now in progress. The provider is working on your request.';
      case 'COMPLETED':
        return 'Service completed! Please leave a review to help other customers.';
      default:
        return 'Your booking is being processed.';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Booking not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Track Your Service
          </h1>
          <p className="text-gray-600">
            Booking #{booking.id} • {booking.serviceId.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tracking Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Service Status</span>
                  {getStatusBadge(booking.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {getStatusMessage(booking.status)}
                </p>
                
                {/* Progress Steps */}
                <div className="space-y-4">
                  {['PENDING_CONFIRMATION', 'CONFIRMED', 'PROVIDER_ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED'].map((step, index) => {
                    const isCompleted = getStatusStep(booking.status) > index;
                    const isCurrent = getStatusStep(booking.status) === index + 1;
                    
                    return (
                      <div key={step} className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isCurrent 
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-400'
                        }`}>
                          {isCompleted ? (
                            <CheckCircleIcon className="h-5 w-5" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className={`flex-1 ${isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'}`}>
                          {step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Provider Information */}
            {booking.providerId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Service Provider
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{booking.providerId.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={booking.providerId.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {booking.providerId.verified ? 'Verified' : 'Pending Verification'}
                          </Badge>
                          <Badge className={booking.providerId.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {booking.providerId.isOnline ? 'Online' : 'Offline'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <PhoneIcon className="h-4 w-4" />
                        <span>{booking.providerId.phone}</span>
                      </div>

                      {booking.providerId.currentLat && booking.providerId.currentLng && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Current Location:</span> 
                          <span className="ml-2">
                            {booking.providerId.currentLat.toFixed(4)}, {booking.providerId.currentLng.toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <Button variant="outline" size="sm">
                        Contact Provider
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{booking.serviceId.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{booking.serviceId.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium text-right max-w-xs">{booking.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-lg">₹{booking.total}</span>
                  </div>
                  {booking.notes && (
                    <div className="pt-4 border-t">
                      <span className="text-gray-600">Notes:</span>
                      <p className="text-sm text-gray-700 mt-1">{booking.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* ETA Card */}
            {booking.providerId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Estimated Arrival
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {eta}
                    </div>
                    <p className="text-sm text-gray-600">
                      Provider is on the way to your location
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Real-time Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Live Updates</span>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {trackingUpdates.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No updates yet</p>
                      <p className="text-xs">Updates will appear here in real-time</p>
                    </div>
                  ) : (
                    trackingUpdates.map((update, index) => (
                      <div key={index} className="flex items-start space-x-3 p-2 rounded-lg bg-gray-50">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            {update.type === 'status' && 'Status updated'}
                            {update.type === 'location' && 'Location updated'}
                            {update.type === 'eta' && 'ETA updated'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {update.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
                <Button variant="outline" className="w-full">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  View on Map
                </Button>
                <Button variant="outline" className="w-full">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
