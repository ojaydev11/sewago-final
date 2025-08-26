
'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { 
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import BookingQueue from '@/components/admin/BookingQueue';
import LiveProviderMap from '@/components/admin/LiveProviderMap';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  lateBookings: number;
  avgResponseTime: number;
  riskAssessments: number;
  supportTickets: number;
  providerCertifications: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Only fetch session if auth is enabled
    if (process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true') {
      const fetchSession = async () => {
        try {
          const response = await fetch('/api/auth/session');
          if (response.ok) {
            const sessionData = await response.json();
            setSession(sessionData);
          }
        } catch (error) {
          console.error('Failed to fetch session:', error);
        }
      };
      fetchSession();
    }
    fetchDashboardStats();
  }, []);

  // Check if auth is enabled - moved to client-side check
  const [authEnabled, setAuthEnabled] = useState(false);
  
  useEffect(() => {
    setAuthEnabled(process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true');
  }, []);

  if (!authEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Authentication is currently disabled.</p>
        </div>
      </div>
    );
  }

  const fetchDashboardStats = async () => {
    try {
      // Simulate API call - in real implementation, fetch from actual endpoints
      const mockStats: DashboardStats = {
        totalBookings: 1247,
        pendingBookings: 23,
        lateBookings: 5,
        avgResponseTime: 12.5,
        riskAssessments: 89,
        supportTickets: 15,
        providerCertifications: 156
      };
      
      setTimeout(() => {
        setStats(mockStats);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setLoading(false);
    }
  };

  if (!session || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Quality, Trust & Risk Management Overview
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings.toString()}
              icon={DocumentTextIcon}
              color="bg-blue-500"
            />
            
            <StatCard
              title="Pending Bookings"
              value={stats.pendingBookings.toString()}
              icon={ClockIcon}
              color="bg-yellow-500"
              alert={stats.pendingBookings > 20}
            />
            
            <StatCard
              title="Late Bookings"
              value={stats.lateBookings.toString()}
              icon={ExclamationTriangleIcon}
              color="bg-red-500"
              alert={stats.lateBookings > 10}
            />
            
            <StatCard
              title="Avg Response Time"
              value={`${stats.avgResponseTime}min`}
              icon={ChartBarIcon}
              color="bg-green-500"
            />
          </div>
        )}

        {/* Live Operations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BookingQueue maxBookings={5} />
          <LiveProviderMap />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QuickActionCard
            title="SLA Monitoring"
            description="Monitor provider response times and job completion"
            icon={ClockIcon}
            href="/admin/sla"
            color="bg-blue-600"
          />
          
          <QuickActionCard
            title="Risk Management"
            description="Review high-risk bookings and fraud detection"
            icon={ShieldCheckIcon}
            href="/admin/risk"
            color="bg-red-600"
          />
          
          <QuickActionCard
            title="Support Tickets"
            description="Manage customer support requests and disputes"
            icon={DocumentTextIcon}
            href="/admin/support"
            color="bg-green-600"
          />
          
          <QuickActionCard
            title="Provider Training"
            description="Monitor certifications and training progress"
            icon={UserGroupIcon}
            href="/admin/training"
            color="bg-purple-600"
          />
          
          <QuickActionCard
            title="Audit Logs"
            description="Review system activity and security events"
            icon={DocumentTextIcon}
            href="/admin/audit"
            color="bg-gray-600"
          />
          
          <QuickActionCard
            title="Performance"
            description="Monitor system performance and optimization"
            icon={ChartBarIcon}
            href="/admin/performance"
            color="bg-orange-600"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <ActivityItem
                type="risk"
                message="High-risk booking detected: BK1234567"
                time="2 minutes ago"
              />
              <ActivityItem
                type="sla"
                message="Provider response time exceeded for BK1234568"
                time="5 minutes ago"
              />
              <ActivityItem
                type="support"
                message="New support ticket created: TK9876543"
                time="10 minutes ago"
              />
              <ActivityItem
                type="training"
                message="Provider completed safety certification"
                time="15 minutes ago"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  alert = false 
}: { 
  title: string; 
  value: string; 
  icon: any; 
  color: string;
  alert?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {alert && (
        <div className="mt-2 flex items-center text-red-600">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">Requires attention</span>
        </div>
      )}
    </div>
  );
}

function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color 
}: { 
  title: string; 
  description: string; 
  icon: any; 
  href: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center mb-4">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-3">{title}</h3>
        </div>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  );
}

function ActivityItem({ 
  type, 
  message, 
  time 
}: { 
  type: string; 
  message: string; 
  time: string;
}) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'risk': return 'bg-red-100 text-red-800';
      case 'sla': return 'bg-yellow-100 text-yellow-800';
      case 'support': return 'bg-blue-100 text-blue-800';
      case 'training': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
          {type.toUpperCase()}
        </span>
        <span className="ml-3 text-sm text-gray-900">{message}</span>
      </div>
      <span className="text-xs text-gray-500">{time}</span>
    </div>
  );
}
