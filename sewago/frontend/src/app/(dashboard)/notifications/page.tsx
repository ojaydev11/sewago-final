'use client';

// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { isNotificationsEnabled } from '@/lib/featureFlags';

export default function NotificationsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!session?.user) {
      router.push('/auth/login?callbackUrl=/notifications');
    }
  }, [session, router]);

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if notifications are enabled
  if (!isNotificationsEnabled()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications Disabled</h1>
          <p className="text-gray-600">This feature is currently not available.</p>
        </div>
      </div>
    );
  }

  // Return a simple message when notifications are enabled
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔔</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications Enabled</h1>
        <p className="text-gray-600">This feature is currently under development.</p>
      </div>
    </div>
  );
}
