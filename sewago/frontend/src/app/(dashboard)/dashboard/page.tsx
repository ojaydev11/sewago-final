'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Force dynamic rendering to prevent build-time pre-rendering
export const dynamic = 'force-dynamic';

// Mock session hook - replace with actual backend integration
const useSession = () => ({ data: { user: { name: 'Mock User', email: 'mock@example.com' } } });
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Trophy,
  Star,
  Flame,
  Gift,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LoyaltyPointsCard } from '@/components/gamification/LoyaltyPointsCard';
import { BadgeCollection } from '@/components/gamification/BadgeCollection';
import { StreakTracker } from '@/components/gamification/StreakTracker';
import { useGamification } from '@/hooks/useGamification';

interface Booking {
  _id: string;
  serviceId: {
    _id: string;
    name: string;
    slug: string;
    basePrice: number;
    category: string;
  };
  providerId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  date: string;
  timeSlot: string;
  address: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: gamificationData, loading: gamificationLoading, AchievementNotificationComponent } = useGamification();
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchRecentBookings();
    }
  }, [session]);

  const fetchRecentBookings = async () => {
    try {
      // This would be replaced with actual API call
      // For now, using mock data
      setRecentBookings([]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {session?.user?.name || 'User'}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your account today.
            </p>
          </motion.div>

          {/* Quick Stats */}
          {!gamificationLoading && gamificationData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {gamificationData.points.balance.availablePoints.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Points</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {gamificationData.badges.unlockedCount}
                  </div>
                  <div className="text-sm text-gray-600">Badges</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.max(...gamificationData.streaks.streaks.map(s => s.currentStreak), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Best Streak</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Gift className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {gamificationData.challenges.activeCount}
                  </div>
                  <div className="text-sm text-gray-600">Active Challenges</div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Dashboard */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your recent bookings and service history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingBookings ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentBookings.length > 0 ? (
                    <div className="space-y-4">
                      {recentBookings.map((booking) => (
                        <div key={booking._id} className="border rounded-lg p-4">
                          {/* Booking details would go here */}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        No recent bookings
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Book your first service to get started!
                      </p>
                      <Link href="/services">
                        <Button>
                          Browse Services
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gamification Overview */}
              {!gamificationLoading && gamificationData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-purple-500" />
                            Rewards & Achievements
                          </CardTitle>
                          <CardDescription>
                            Track your progress and earn rewards
                          </CardDescription>
                        </div>
                        <Link href="/dashboard/rewards">
                          <Button variant="outline" size="sm">
                            View All
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LoyaltyPointsCard 
                          data={gamificationData.points} 
                          compact 
                        />
                        <BadgeCollection 
                          data={gamificationData.badges} 
                          compact 
                        />
                      </div>
                      
                      {gamificationData.streaks.streaks.length > 0 && (
                        <div className="mt-4">
                          <StreakTracker 
                            data={gamificationData.streaks} 
                            compact 
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/services" className="block">
                    <Button className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book a Service
                    </Button>
                  </Link>
                  
                  <Link href="/dashboard/rewards" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Trophy className="w-4 h-4 mr-2" />
                      View Rewards
                    </Button>
                  </Link>
                  
                  <Link href="/dashboard/account" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Manage Account
                    </Button>
                  </Link>
                  
                  <Link href="/support" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="w-4 h-4 mr-2" />
                      Get Support
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Tips & Updates */}
              <Card>
                <CardHeader>
                  <CardTitle>Tips & Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-1">
                        Earn More Points!
                      </h4>
                      <p className="text-sm text-blue-700">
                        Leave reviews after each service to earn bonus points and help other customers.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-900 mb-1">
                        Seasonal Challenges
                      </h4>
                      <p className="text-sm text-green-700">
                        Check out our Dashain cleaning challenge for extra rewards!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Notifications */}
      <AchievementNotificationComponent />
    </>
  );
}
