"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Avatar, Skeleton } from '@/components/ui';
import { Calendar, Clock, MapPin, User, Phone, Mail, DollarSign, CheckCircle, XCircle, AlertCircle, Loader2, Briefcase, Star, TrendingUp, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  _id: string;
  serviceId: {
    _id: string;
    name: string;
    category: string;
    basePrice: number;
  };
  customerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  date: string;
  timeSlot: string;
  address: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

interface ProviderStats {
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  totalEarnings: number;
  averageRating: number;
}

export default function ProviderDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [activeTab, setActiveTab] = useState('queue');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    if (status === 'authenticated' && session?.user?.role !== 'provider') {
      router.push('/dashboard');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'provider') {
      fetchBookings();
      fetchStats();
    }
  }, [status, session, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings?role=provider');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      setError('Failed to fetch bookings');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/provider/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update booking');
      
      const data = await response.json();
      setSuccessMessage(`Booking ${newStatus} successfully`);
      setBookings(prev => prev.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: newStatus as any }
          : booking
      ));
      
      // Refresh stats after status change
      fetchStats();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Failed to update booking status');
      console.error('Error updating booking:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: AlertCircle, text: 'Pending' },
      confirmed: { variant: 'default' as const, icon: CheckCircle, text: 'Confirmed' },
      completed: { variant: 'default' as const, icon: CheckCircle, text: 'Completed' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, text: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getPendingBookings = () => bookings.filter(booking => booking.status === 'pending');
  const getConfirmedBookings = () => bookings.filter(booking => booking.status === 'confirmed');
  const getTodayBookings = () => {
    const today = new Date().toDateString();
    return bookings.filter(booking => 
      new Date(booking.date).toDateString() === today && 
      ['confirmed', 'pending'].includes(booking.status)
    );
  };

  const getCompletedBookings = () => bookings.filter(booking => booking.status === 'completed');

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'provider') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your jobs and track your earnings</p>
            </div>
            <Link href="/provider/onboarding">
              <Button variant="outline" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Update Profile
              </Button>
            </Link>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                {successMessage}
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.completedJobs || 0}</div>
                <p className="text-xs text-muted-foreground">Successfully completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats?.totalEarnings || 0}</div>
                <p className="text-xs text-muted-foreground">All time earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.averageRating?.toFixed(1) || '0.0'}</div>
                <p className="text-xs text-muted-foreground">Average rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="queue">Job Queue ({getPendingBookings().length})</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed ({getConfirmedBookings().length})</TabsTrigger>
              <TabsTrigger value="today">Today ({getTodayBookings().length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({getCompletedBookings().length})</TabsTrigger>
            </TabsList>

            {/* Job Queue Tab */}
            <TabsContent value="queue" className="space-y-4">
              {getPendingBookings().length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">No pending jobs</p>
                    <p className="text-gray-400 text-sm">New job requests will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                getPendingBookings().map((booking) => (
                  <Card key={booking._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{booking.serviceId.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-2">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(booking.date), 'PPP')}
                            <Clock className="h-4 w-4 ml-2" />
                            {booking.timeSlot}
                          </CardDescription>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{booking.customerId.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{booking.customerId.email}</span>
                          </div>
                          {booking.customerId.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{booking.customerId.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{booking.address}</span>
                          </div>
                          {booking.notes && (
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                              <span className="text-sm text-gray-600">{booking.notes}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-lg">₹{booking.serviceId.basePrice}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                          className="flex-1"
                        >
                          Accept Job
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                          className="flex-1"
                        >
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Confirmed Jobs Tab */}
            <TabsContent value="confirmed" className="space-y-4">
              {getConfirmedBookings().length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">No confirmed jobs</p>
                    <p className="text-gray-400 text-sm">Accepted jobs will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                getConfirmedBookings().map((booking) => (
                  <Card key={booking._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{booking.serviceId.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-2">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(booking.date), 'PPP')}
                            <Clock className="h-4 w-4 ml-2" />
                            {booking.timeSlot}
                          </CardDescription>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{booking.customerId.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{booking.address}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-lg">₹{booking.serviceId.basePrice}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          onClick={() => updateBookingStatus(booking._id, 'completed')}
                          className="flex-1"
                        >
                          Mark as Completed
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Today's Jobs Tab */}
            <TabsContent value="today" className="space-y-4">
              {getTodayBookings().length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">No jobs today</p>
                    <p className="text-gray-400 text-sm">You're all caught up!</p>
                  </CardContent>
                </Card>
              ) : (
                getTodayBookings().map((booking) => (
                  <Card key={booking._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{booking.serviceId.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-2">
                            <Clock className="h-4 w-4" />
                            {booking.timeSlot}
                          </CardDescription>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{booking.customerId.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{booking.address}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-lg">₹{booking.serviceId.basePrice}</span>
                          </div>
                        </div>
                      </div>
                      {booking.status === 'pending' && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                            className="flex-1"
                          >
                            Accept Job
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                            className="flex-1"
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                      {booking.status === 'confirmed' && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            onClick={() => updateBookingStatus(booking._id, 'completed')}
                            className="flex-1"
                          >
                            Mark as Completed
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Completed Jobs Tab */}
            <TabsContent value="completed" className="space-y-4">
              {getCompletedBookings().length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">No completed jobs yet</p>
                    <p className="text-gray-400 text-sm">Complete your first job to see it here</p>
                  </CardContent>
                </Card>
              ) : (
                getCompletedBookings().map((booking) => (
                  <Card key={booking._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{booking.serviceId.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-2">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(booking.date), 'PPP')}
                            <Clock className="h-4 w-4 ml-2" />
                            {booking.timeSlot}
                          </CardDescription>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{booking.customerId.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{booking.address}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-lg">₹{booking.serviceId.basePrice}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
