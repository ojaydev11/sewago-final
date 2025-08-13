'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  _id: string;
  serviceId: {
    _id: string;
    name: string;
    category: string;
    basePrice: number;
  };
  date: string;
  timeSlot: string;
  address: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  providerId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  // Check for new booking success message
  const newBookingId = searchParams.get('booking');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }
    
    if (session.user.role !== 'customer') {
      router.push('/provider/dashboard');
      return;
    }

    fetchBookings();
  }, [session, status, router]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bookings?role=customer');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh bookings
        fetchBookings();
      } else {
        setError('Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      setError('Failed to update booking');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'Pending', icon: Clock },
      confirmed: { variant: 'default' as const, text: 'Confirmed', icon: CheckCircle },
      completed: { variant: 'default' as const, text: 'Completed', icon: CheckCircle },
      cancelled: { variant: 'destructive' as const, text: 'Cancelled', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getUpcomingBookings = () => {
    return bookings.filter(booking => 
      ['pending', 'confirmed'].includes(booking.status) && 
      new Date(booking.date) >= new Date()
    );
  };

  const getPastBookings = () => {
    return bookings.filter(booking => 
      ['completed', 'cancelled'].includes(booking.status) || 
      new Date(booking.date) < new Date()
    );
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></Loader2>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'customer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {session.user.name}!
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your service bookings and track their progress
              </p>
            </div>
            <Link href="/services">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Book New Service
              </Button>
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {newBookingId && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">
                    Booking Created Successfully!
                  </h3>
                  <p className="text-green-700 text-sm">
                    Your service has been booked. We'll notify you when a provider is assigned.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {getUpcomingBookings().length}
                  </p>
                  <p className="text-sm text-gray-600">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookings.filter(b => b.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookings.filter(b => b.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookings.length}
                  </p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming">
              Upcoming Bookings ({getUpcomingBookings().length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Bookings ({getPastBookings().length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></Loader2>
                <p className="mt-4 text-gray-600">Loading bookings...</p>
              </div>
            ) : getUpcomingBookings().length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No upcoming bookings
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any upcoming service bookings.
                  </p>
                  <Link href="/services">
                    <Button>Book Your First Service</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              getUpcomingBookings().map((booking) => (
                <Card key={booking._id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <CardTitle className="text-lg">{booking.serviceId.name}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(booking.date), 'PPP')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.timeSlot}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(booking.status)}
                        <span className="text-lg font-semibold text-primary">
                          ₹{booking.serviceId.basePrice}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <span className="text-sm text-gray-600">{booking.address}</span>
                      </div>
                      {booking.notes && (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-gray-400 mt-1" />
                          <span className="text-sm text-gray-600">{booking.notes}</span>
                        </div>
                      )}
                    </div>

                    {booking.providerId && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Assigned Provider</h4>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{booking.providerId.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{booking.providerId.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{booking.providerId.email}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                          >
                            Cancel Booking
                          </Button>
                          <Link href={`/book?service=${booking.serviceId.name.toLowerCase().replace(' ', '-')}`}>
                            <Button variant="outline" size="sm">
                              Rebook Service
                            </Button>
                          </Link>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateBookingStatus(booking._id, 'completed')}
                        >
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {getPastBookings().length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No past bookings
                  </h3>
                  <p className="text-gray-600">
                    Your completed and cancelled bookings will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              getPastBookings().map((booking) => (
                <Card key={booking._id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <CardTitle className="text-lg">{booking.serviceId.name}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(booking.date), 'PPP')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.timeSlot}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(booking.status)}
                        <span className="text-lg font-semibold text-primary">
                          ₹{booking.serviceId.basePrice}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <span className="text-sm text-gray-600">{booking.address}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/book?service=${booking.serviceId.name.toLowerCase().replace(' ', '-')}`}>
                        <Button variant="outline" size="sm">
                          Book Again
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Error Message */}
        {error && (
          <div className="mt-6 text-red-600 text-center bg-red-50 p-4 rounded-md">
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBookings}
              className="ml-4"
            >
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
