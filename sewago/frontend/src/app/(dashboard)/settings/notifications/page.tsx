<<<<<<< HEAD
import { getServerSession } from 'next-auth';
=======
'use client';
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

import { redirect } from 'next/navigation';
<<<<<<< HEAD
import { authOptions } from '@/lib/auth';
import { NotificationSettings } from '@/components/NotificationSettings';

export default async function NotificationSettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }
=======
import { NotificationSettings } from '@/components/NotificationSettings';

export default function NotificationSettingsPage() {
  // Notification settings are disabled in frontend-only mode
  redirect('/dashboard');
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
          <p className="mt-2 text-gray-600">
            Customize how and when you receive notifications
          </p>
        </div>
        
        <NotificationSettings />
      </div>
    </div>
  );
}
