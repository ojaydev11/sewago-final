'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { useRouter } from 'next/navigation';
import EnhancedNavbar from '@/components/EnhancedNavbar';
import EnhancedFooter from '@/components/EnhancedFooter';
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Shield, 
  Star, 
  Settings, 
  LogOut,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface Booking {
  id: string;
  serviceName: string;
  providerName: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  address: string;
  price: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/en/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated]);

  const loadBookings = async () => {
    try {
      const response = await apiService.getMyBookings();
      if (response.data) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/en');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <EnhancedNavbar />
      
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl text-white p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  Manage your services, track bookings, and stay updated with your local service providers.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - User Info & Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Profile Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mt-2">
                    <Shield className="w-4 h-4 mr-1" />
                    {user?.role === 'provider' ? 'Service Provider' : 'Customer'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-3" />
                    <span>{user?.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-3" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-3" />
                    <span>Nepal</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    href="/en/profile"
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/en/services"
                    className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Search className="w-5 h-5 mr-3" />
                    Find Services
                  </Link>
                  <Link
                    href="/en/bookings/new"
                    className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    Book New Service
                  </Link>
                  <Link
                    href="/en/support"
                    className="flex items-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Shield className="w-5 h-5 mr-3" />
                    Get Support
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Bookings</span>
                    <span className="text-2xl font-bold text-blue-600">{bookings.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Bookings</span>
                    <span className="text-2xl font-bold text-green-600">
                      {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {bookings.filter(b => b.status === 'completed').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Bookings & Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Bookings */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Recent Bookings</h3>
                  <Link
                    href="/en/bookings"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All
                  </Link>
                </div>

                {isLoadingBookings ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading bookings...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h4>
                    <p className="text-gray-500 mb-4">Start by booking your first service</p>
                    <Link
                      href="/en/services"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Book a Service
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{booking.serviceName}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            <span>{booking.providerName}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{booking.scheduledTime}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="truncate">{booking.address}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-lg font-semibold text-blue-600">
                            ₹{booking.price}
                          </span>
                          <Link
                            href={`/en/bookings/${booking.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Welcome to SewaGo!</span>
                      </p>
                      <p className="text-xs text-gray-500">Account created successfully</p>
                      <p className="text-xs text-gray-400">Just now</p>
                    </div>
                  </div>
                  
                  {bookings.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">First service booked!</span>
                        </p>
                        <p className="text-xs text-gray-500">You're all set to get started</p>
                        <p className="text-xs text-gray-400">Recently</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className="mt-8 text-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </main>

      <EnhancedFooter />
    </>
  );
}
