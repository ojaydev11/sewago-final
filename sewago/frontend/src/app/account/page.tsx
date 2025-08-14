// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AccountPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  // Type assertion to include role property
  const userWithRole = user as typeof user & { role?: string };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            <p className="mt-1 text-sm text-gray-600">
              Welcome back, {user.name}
            </p>
          </div>

          {/* Profile Section */}
          <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Type</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{userWithRole.role || 'user'}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/services"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Browse Services</p>
                  <p className="text-sm text-gray-500">Find and book services</p>
                </div>
              </Link>

              <Link
                href="/account/bookings"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">My Bookings</p>
                  <p className="text-sm text-gray-500">View booking history</p>
                </div>
              </Link>

              {userWithRole.role === 'provider' && (
                <Link
                  href="/provider/dashboard"
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">Provider Dashboard</p>
                    <p className="text-sm text-gray-500">Manage service requests</p>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Account Settings */}
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
