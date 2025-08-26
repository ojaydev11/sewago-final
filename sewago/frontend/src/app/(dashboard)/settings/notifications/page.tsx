// Mock auth - replace with actual backend integration
const getServerSession = async () => null;
const authOptions = {};

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

import { redirect } from 'next/navigation';
import { NotificationSettings } from '@/components/NotificationSettings';

export default async function NotificationSettingsPage() {
  // Notification settings are disabled in frontend-only mode
  redirect('/dashboard');

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
