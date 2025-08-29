<<<<<<< HEAD
=======
'use client';

>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
import React from 'react';

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

<<<<<<< HEAD
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
=======
import { redirect } from 'next/navigation';
import AdminVerificationDashboard from '@/components/AdminVerificationDashboard';

export default function AdminVerificationPage() {
  // Admin verification is disabled in frontend-only mode
  redirect('/admin/dashboard');
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
<<<<<<< HEAD
            Provider Verification Management
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Review and manage provider verification requests to ensure quality and trust
=======
            Admin Verification Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage provider verification requests and maintain platform quality standards
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
          </p>
        </div>
        
        <AdminVerificationDashboard />
      </div>
    </div>
  );
}
