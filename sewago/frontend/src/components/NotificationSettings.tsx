'use client';

import { useState, useEffect } from 'react';
import { BellIcon, BellSlashIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { pushNotificationService } from '@/lib/pushNotificationService';
import { useToast } from '@/components/ui/toast';

interface NotificationPreferences {
  inApp: boolean;
  push: boolean;
  email: boolean;
  sms: boolean;
  types: {
    booking: boolean;
    payment: boolean;
    verification: boolean;
    system: boolean;
    promotional: boolean;
    reminder: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export function NotificationSettings() {
  const { addToast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    inApp: true,
    push: false,
    email: false,
    sms: false,
    types: {
      booking: true,
      payment: true,
      verification: true,
      system: true,
      promotional: false,
      reminder: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });

  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkPushSupport();
  }, []);

  const checkPushSupport = async () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setPushSupported(supported);
    
    if (supported) {
      const enabled = await pushNotificationService.isEnabled();
      setPushEnabled(enabled);
    }
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleTypeChange = (type: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: value,
      },
    }));
  };

  const handleQuietHoursChange = (key: string, value: string | boolean) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [key]: value,
      },
    }));
  };

  const handlePushToggle = async () => {
    if (!pushSupported) return;

    setLoading(true);
    try {
      if (pushEnabled) {
        const success = await pushNotificationService.disable();
        if (success) {
          setPushEnabled(false);
          addToast({
            type: 'success',
            title: 'Push notifications disabled',
            message: 'You will no longer receive push notifications',
          });
        }
      } else {
        const success = await pushNotificationService.enable();
        if (success) {
          setPushEnabled(true);
          addToast({
            type: 'success',
            title: 'Push notifications enabled',
            message: 'You will now receive push notifications',
          });
        } else {
          addToast({
            type: 'error',
            title: 'Permission denied',
            message: 'Please allow notifications in your browser settings',
          });
        }
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update push notification settings',
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      // Here you would typically save to your backend
      // await updateNotificationPreferences(preferences);
      
      addToast({
        type: 'success',
        title: 'Settings saved',
        message: 'Your notification preferences have been updated',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to save notification preferences',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
        
        {/* Delivery Methods */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-700">Delivery Methods</h3>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.inApp}
                onChange={(e) => handlePreferenceChange('inApp', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center space-x-2">
                <BellIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-700">In-app notifications</span>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.push}
                onChange={(e) => handlePreferenceChange('push', e.target.checked)}
                disabled={!pushSupported}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <div className="flex items-center space-x-2">
                <DevicePhoneMobileIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-700">Push notifications</span>
                {!pushSupported && (
                  <span className="text-xs text-gray-500">(Not supported)</span>
                )}
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.email}
                onChange={(e) => handlePreferenceChange('email', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Email notifications</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.sms}
                onChange={(e) => handlePreferenceChange('sms', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">SMS notifications</span>
            </label>
          </div>
        </div>

        {/* Push Notification Toggle */}
        {pushSupported && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-medium text-gray-700">Push Notifications</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Receive notifications even when the app is closed
                </p>
              </div>
              <button
                onClick={handlePushToggle}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  pushEnabled ? 'bg-blue-600' : 'bg-gray-200'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pushEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Notification Types */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-md font-medium text-gray-700 mb-4">Notification Types</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.types.booking}
                onChange={(e) => handleTypeChange('booking', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Booking updates</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.types.payment}
                onChange={(e) => handleTypeChange('payment', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Payment confirmations</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.types.verification}
                onChange={(e) => handleTypeChange('verification', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Verification status</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.types.system}
                onChange={(e) => handleTypeChange('system', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">System updates</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.types.promotional}
                onChange={(e) => handleTypeChange('promotional', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Promotional offers</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.types.reminder}
                onChange={(e) => handleTypeChange('reminder', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Reminders</span>
            </label>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-gray-700">Quiet Hours</h3>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.quietHours.enabled}
                onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable</span>
            </label>
          </div>
          
          {preferences.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHours.start}
                  onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHours.end}
                  onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-500 mt-2">
            During quiet hours, you'll only receive urgent notifications
          </p>
        </div>

        {/* Save Button */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={savePreferences}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
