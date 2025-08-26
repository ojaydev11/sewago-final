'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
// Mock session hook - replace with actual backend integration
const useSession = () => ({ data: { user: { id: 'mock-user-id', name: 'Mock User', email: 'mock@example.com' } } });
// Mock notification services - replace with actual backend integration
const notificationService = {
  getUserNotifications: async () => ({ notifications: [], unreadCount: 0 }),
  createNotification: async (data: any) => ({ id: 'mock', ...data }),
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {}
};
import { pushNotificationService } from '@/lib/pushNotificationService';
import { useToast } from '@/components/ui/toast';

interface NotificationContextType {
  // Notification state
  notifications: any[];
  unreadCount: number;
  isConnected: boolean;
  
  // Notification actions
  createNotification: (data: any) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  
  // Push notification actions
  enablePushNotifications: () => Promise<boolean>;
  disablePushNotifications: () => Promise<boolean>;
  isPushEnabled: boolean;
  
  // Utility functions
  refreshNotifications: () => Promise<void>;
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { data: session } = useSession();
  const { addToast } = useToast();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize push notification service
  useEffect(() => {
    const initPushService = async () => {
      try {
        await pushNotificationService.initialize();
        const enabled = await pushNotificationService.isEnabled();
        setIsPushEnabled(enabled);
      } catch (error) {
        console.error('Failed to initialize push notification service:', error);
      }
    };

    initPushService();
  }, []);

  // Fetch notifications when session changes
  useEffect(() => {
    if (session?.user?.id) {
      refreshNotifications();
    }
  }, [session?.user?.id]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      addToast({
        type: 'error',
        title: 'Notification Error',
        message: error,
      });
    }
  }, [error, addToast]);

  const refreshNotifications = async () => {
    if (!session?.user?.id) return;

    try {
      setError(null);
      const result = await notificationService.getUserNotifications({
        userId: session.user.id,
        limit: 50,
      });
      
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    }
  };

  const createNotification = async (data: any) => {
    if (!session?.user?.id) return;

    try {
      setError(null);
      const notification = await notificationService.createNotification({
        ...data,
        userId: session.user.id,
      });
      
      // Add to local state
      setNotifications(prev => [notification, ...prev]);
      if (!notification.readAt) {
        setUnreadCount(prev => prev + 1);
      }
      
      addToast({
        type: 'success',
        title: 'Notification Created',
        message: 'Your notification has been created successfully',
      });
    } catch (err) {
      console.error('Error creating notification:', err);
      setError('Failed to create notification');
    }
  };

  const markAsRead = async (id: string) => {
    if (!session?.user?.id) return;

    try {
      setError(null);
      await notificationService.markAsRead(id, session.user.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, readAt: new Date().toISOString() }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    if (!session?.user?.id) return;

    try {
      setError(null);
      await notificationService.markAllAsRead(session.user.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      
      addToast({
        type: 'success',
        title: 'All Notifications Read',
        message: 'All notifications have been marked as read',
      });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (id: string) => {
    if (!session?.user?.id) return;

    try {
      setError(null);
      await notificationService.deleteNotification(id, session.user.id);
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      if (deletedNotification && !deletedNotification.readAt) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      addToast({
        type: 'success',
        title: 'Notification Deleted',
        message: 'Notification has been deleted successfully',
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification');
    }
  };

  const enablePushNotifications = async (): Promise<boolean> => {
    try {
      setError(null);
      const success = await pushNotificationService.enable();
      
      if (success) {
        setIsPushEnabled(true);
        addToast({
          type: 'success',
          title: 'Push Notifications Enabled',
          message: 'You will now receive push notifications',
        });
      } else {
        addToast({
          type: 'error',
          title: 'Permission Denied',
          message: 'Please allow notifications in your browser settings',
        });
      }
      
      return success;
    } catch (err) {
      console.error('Error enabling push notifications:', err);
      setError('Failed to enable push notifications');
      return false;
    }
  };

  const disablePushNotifications = async (): Promise<boolean> => {
    try {
      setError(null);
      const success = await pushNotificationService.disable();
      
      if (success) {
        setIsPushEnabled(false);
        addToast({
          type: 'success',
          title: 'Push Notifications Disabled',
          message: 'You will no longer receive push notifications',
        });
      }
      
      return success;
    } catch (err) {
      console.error('Error disabling push notifications:', err);
      setError('Failed to disable push notifications');
      return false;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    enablePushNotifications,
    disablePushNotifications,
    isPushEnabled,
    refreshNotifications,
    clearError,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
