import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminVerificationDashboard from '@/components/AdminVerificationDashboard';

export default async function AdminVerificationPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

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
