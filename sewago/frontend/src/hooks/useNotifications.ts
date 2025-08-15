import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/components/ui/toast';
import { isNotificationsEnabled, isPushNotificationsEnabled } from '@/lib/featureFlags';

export interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'verification' | 'system' | 'promotional' | 'reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  tags: string[];
  readAt?: string;
  clickedAt?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface NotificationFilters {
  type?: Notification['type'];
  priority?: Notification['priority'];
  category?: Notification['category'];
  read?: boolean;
  limit?: number;
  offset?: number;
}

export function useNotifications() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if notifications are enabled
  const notificationsEnabled = isNotificationsEnabled();

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!session?.user?.id || !notificationsEnabled) return;

    const connectSocket = () => {
      try {
        socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000', {
          path: '/ws/socket.io',
          query: { userId: session.user.id },
          transports: ['websocket', 'polling'],
          timeout: 20000,
        });

        socketRef.current.on('connect', () => {
          console.log('Connected to notification socket');
          setError(null);
        });

        socketRef.current.on('disconnect', () => {
          console.log('Disconnected from notification socket');
          setError('Connection lost. Reconnecting...');
        });

        socketRef.current.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
          setError('Connection failed. Retrying...');
          
          // Attempt to reconnect after 5 seconds
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(connectSocket, 5000);
        });

        // Listen for new notifications
        socketRef.current.on('notification:new', (notification: Notification) => {
          setNotifications(prev => [notification, ...prev]);
          setStats(prev => prev ? { ...prev, unread: prev.unread + 1 } : null);
          
          // Show toast notification
          addToast({
            type: notification.category === 'error' ? 'error' : 
                  notification.category === 'warning' ? 'warning' : 
                  notification.category === 'success' ? 'success' : 'info',
            title: notification.title,
            message: notification.message,
            duration: notification.priority === 'urgent' ? 10000 : 5000,
          });
        });

        // Join user room
        socketRef.current.emit('join:user', session.user.id);

      } catch (err) {
        console.error('Failed to connect to notification socket:', err);
        setError('Failed to connect to notifications');
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [session?.user?.id, addToast]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (filters: NotificationFilters = {}) => {
    if (!session?.user?.id || !notificationsEnabled) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.category) params.append('category', filters.category);
      if (filters.read !== undefined) params.append('read', filters.read.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/notifications?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const result = await response.json();
      setNotifications(result.data.notifications);
      
      // Update stats if available
      if (result.data.unreadCount !== undefined) {
        setStats(prev => prev ? { ...prev, unread: result.data.unreadCount } : null);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Fetch notification stats
  const fetchStats = useCallback(async () => {
    if (!session?.user?.id || !notificationsEnabled) return;

    try {
      const response = await fetch('/api/notifications/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notification stats');
      }

      const result = await response.json();
      setStats(result.data);
    } catch (err) {
      console.error('Error fetching notification stats:', err);
    }
  }, [session?.user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!session?.user?.id || !notificationsEnabled) return;

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAsRead' }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, readAt: new Date().toISOString() }
            : notification
        )
      );

      // Update stats
      setStats(prev => prev ? { ...prev, unread: Math.max(0, prev.unread - 1) } : null);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, [session?.user?.id]);

  // Mark notification as clicked
  const markAsClicked = useCallback(async (notificationId: string) => {
    if (!session?.user?.id || !notificationsEnabled) return;

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAsClicked' }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as clicked');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, clickedAt: new Date().toISOString() }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as clicked:', err);
      throw err;
    }
  }, [session?.user?.id]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!session?.user?.id || !notificationsEnabled) return;

    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, readAt: new Date().toISOString() }))
      );

      // Update stats
      setStats(prev => prev ? { ...prev, unread: 0 } : null);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, [session?.user?.id]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!session?.user?.id || !notificationsEnabled) return;

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update stats
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.readAt) {
        setStats(prev => prev ? { ...prev, unread: Math.max(0, prev.unread - 1), total: prev.total - 1 } : null);
      } else if (deletedNotification) {
        setStats(prev => prev ? { ...prev, total: prev.total - 1 } : null);
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, [session?.user?.id, notifications]);

  // Create notification
  const createNotification = useCallback(async (data: Omit<Notification, 'id' | 'createdAt' | 'readAt' | 'clickedAt'>) => {
    if (!session?.user?.id || !notificationsEnabled) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create notification');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      console.error('Error creating notification:', err);
      throw err;
    }
  }, [session?.user?.id]);

  // Initial fetch
  useEffect(() => {
    if (session?.user?.id && notificationsEnabled) {
      fetchNotifications();
      fetchStats();
    }
  }, [session?.user?.id, notificationsEnabled, fetchNotifications, fetchStats]);

  // Return early if notifications are disabled
  if (!notificationsEnabled) {
    return {
      notifications: [],
      stats: null,
      loading: false,
      error: null,
      fetchNotifications: async () => {},
      fetchStats: async () => {},
      markAsRead: async () => {},
      markAsClicked: async () => {},
      markAllAsRead: async () => {},
      deleteNotification: async () => {},
      createNotification: async () => {},
      isConnected: false,
    };
  }

  return {
    notifications,
    stats,
    loading,
    error,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markAsClicked,
    markAllAsRead,
    deleteNotification,
    createNotification,
    isConnected: !!socketRef.current?.connected,
  };
}
