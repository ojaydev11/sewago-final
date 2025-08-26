import React from 'react';

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

// Mock auth - replace with actual backend integration
const getServerSession = async () => null;
const authOptions = {};
import { redirect } from 'next/navigation';
import AdminVerificationDashboard from '@/components/AdminVerificationDashboard';

export default async function AdminVerificationPage() {
  // Admin verification is disabled in frontend-only mode
  redirect('/dashboard');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Provider Verification Management
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Review and manage provider verification requests to ensure quality and trust
          </p>
        </div>
        
        <AdminVerificationDashboard />
      </div>
    </div>
  );
}
