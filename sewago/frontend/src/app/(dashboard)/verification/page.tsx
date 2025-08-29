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
=======
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
import { redirect } from 'next/navigation';
import ProviderVerificationForm from '@/components/ProviderVerificationForm';
import VerificationStatus from '@/components/VerificationStatus';

<<<<<<< HEAD
export default async function VerificationPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  if (session.user.role !== 'provider') {
    redirect('/dashboard');
  }
=======
export default function VerificationPage() {
  // Verification is disabled in frontend-only mode
  redirect('/dashboard');
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Provider Verification
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete your verification to start accepting bookings and building trust with customers
          </p>
        </div>
        
        <VerificationStatus />
        <ProviderVerificationForm />
      </div>
    </div>
  );
}
