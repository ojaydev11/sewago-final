'use client';

import { SubscriptionDashboard } from '@/components/subscriptions';

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function SubscriptionPage() {
  // In a real application, you would get the userId from authentication context
  const userId = 'user-123'; // This would come from auth context/session

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <SubscriptionDashboard userId={userId} />
      </div>
    </div>
  );
}