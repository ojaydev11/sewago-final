'use client';
import 'client-only';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNotifications } from './useNotifications';

interface SmartNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  channel: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  timestamp: Date;
  scheduledFor?: Date;
  aiOptimized: boolean;
  engagementScore?: number;
  actions?: Array<{
    label: string;
    action: string;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
  metadata?: any;
}

interface NotificationPreferences {
  optimalTimes: string[];
  frequency: 'LOW' | 'MEDIUM' | 'HIGH';
  channels: string[];
  categories: Record<string, boolean>;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  locationBased: boolean;
  behaviorBased: boolean;
}

interface NotificationAnalytics {
  totalDeliveries: number;
  openRate: number;
  clickRate: number;
  channelBreakdown: Array<{
    channel: string;
    count: number;
  }>;
}

interface OptimizationSuggestion {
  type: string;
  title: string;
  description: string;
  impact: string;
}

interface UseSmartNotificationsConfig {
  userId: string;
  enableRealtime?: boolean;
  enableAnalytics?: boolean;
  enableOptimization?: boolean;
}

interface UseSmartNotificationsReturn {
  // Notifications
  notifications: SmartNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Preferences
  preferences: NotificationPreferences | null;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<boolean>;
  
  // Analytics
  analytics: NotificationAnalytics | null;
  optimizationSuggestions: OptimizationSuggestion[];
  
  // Actions
  sendNotification: (notification: Partial<SmartNotification>) => Promise<boolean>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  dismissNotification: (id: string) => Promise<boolean>;
  scheduleNotification: (notification: Partial<SmartNotification>, scheduleFor: Date) => Promise<boolean>;
  
  // Smart features
  optimizeDeliveryTiming: (notification: Partial<SmartNotification>) => Promise<Date>;
  getPredictedEngagement: (notification: Partial<SmartNotification>) => Promise<number>;
  getPersonalizedContent: (template: string, context: any) => Promise<string>;
  
  // Utilities
  refresh: () => Promise<void>;
  clearError: () => void;
}

export function useSmartNotifications(config: UseSmartNotificationsConfig): UseSmartNotificationsReturn {
  const {
    userId,
    enableRealtime = true,
    enableAnalytics = true,
    enableOptimization = true
  } = config;

  // State
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  // Use the base notifications hook
  const { markAsRead: baseMarkAsRead, markAllAsRead: baseMarkAllAsRead } = useNotifications();

  // Initialize
  useEffect(() => {
    loadInitialData();
    
    if (enableRealtime) {
      setupRealtimeConnection();
    }

    return () => {
      cleanup();
    };
  }, [userId, enableRealtime]);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadNotifications(),
        loadPreferences(),
        enableAnalytics && loadAnalytics(),
        enableOptimization && loadOptimizationSuggestions()
      ]);
    } catch (err) {
      setError('Failed to load notifications data');
      console.error('Load initial data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}&smart=true&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
          scheduledFor: n.scheduledFor ? new Date(n.scheduledFor) : undefined,
          aiOptimized: n.aiOptimized || false,
          engagementScore: n.engagementScore || Math.random() * 0.8 + 0.2
        })));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      throw error;
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await fetch(`/api/notifications/preferences?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      throw error;
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/ai/smart-notifications?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      throw error;
    }
  };

  const loadOptimizationSuggestions = async () => {
    try {
      const response = await fetch(`/api/ai/smart-notifications?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setOptimizationSuggestions(data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to load optimization suggestions:', error);
      throw error;
    }
  };

  const setupRealtimeConnection = () => {
    if (typeof window === 'undefined') return;

    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/api/notifications/ws?userId=${userId}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Smart notifications WebSocket connected');
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleRealtimeMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('Smart notifications WebSocket disconnected');
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < 5) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000;
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            setupRealtimeConnection();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Smart notifications WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to setup WebSocket connection:', error);
    }
  };

  const handleRealtimeMessage = (data: any) => {
    switch (data.type) {
      case 'notification':
        const newNotification: SmartNotification = {
          ...data.notification,
          timestamp: new Date(data.notification.timestamp),
          scheduledFor: data.notification.scheduledFor ? new Date(data.notification.scheduledFor) : undefined
        };
        setNotifications(prev => [newNotification, ...prev]);
        break;

      case 'notification_read':
        setNotifications(prev => 
          prev.map(n => n.id === data.notificationId ? { ...n, read: true } : n)
        );
        break;

      case 'preferences_updated':
        setPreferences(data.preferences);
        break;

      case 'analytics_updated':
        if (enableAnalytics) {
          setAnalytics(data.analytics);
        }
        break;

      default:
        console.log('Unhandled realtime message type:', data.type);
    }
  };

  const sendNotification = async (notification: Partial<SmartNotification>): Promise<boolean> => {
    try {
      const response = await fetch('/api/ai/smart-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type: notification.type,
          message: notification.message,
          data: notification.metadata,
          priority: notification.priority || 'medium'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add to local state if not real-time
        if (!enableRealtime) {
          const newNotification: SmartNotification = {
            id: data.notificationId,
            title: notification.title || 'Notification',
            message: notification.message || '',
            type: notification.type || 'info',
            channel: 'IN_APP',
            priority: notification.priority || 'medium',
            read: false,
            timestamp: new Date(),
            aiOptimized: true,
            ...notification
          };
          setNotifications(prev => [newNotification, ...prev]);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  };

  const markAsRead = async (id: string): Promise<boolean> => {
    try {
      const success = await baseMarkAsRead(id);
      
      if (success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
      }
      
      return success;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  };

  const markAllAsRead = async (): Promise<boolean> => {
    try {
      const success = await baseMarkAllAsRead(userId);
      
      if (success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
      
      return success;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  };

  const dismissNotification = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
      return false;
    }
  };

  const scheduleNotification = async (
    notification: Partial<SmartNotification>, 
    scheduleFor: Date
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/ai/smart-notifications/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          notification,
          scheduleFor: scheduleFor.toISOString()
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return false;
    }
  };

  const updatePreferences = async (prefs: Partial<NotificationPreferences>): Promise<boolean> => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          preferences: { ...preferences, ...prefs }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
        
        if (enableOptimization) {
          setOptimizationSuggestions(data.optimizationSuggestions || []);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      return false;
    }
  };

  const optimizeDeliveryTiming = async (notification: Partial<SmartNotification>): Promise<Date> => {
    try {
      const response = await fetch('/api/ai/smart-notifications/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          notification,
          preferences
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return new Date(data.optimalTime);
      }
    } catch (error) {
      console.error('Failed to optimize delivery timing:', error);
    }

    // Fallback to current time + 5 minutes
    return new Date(Date.now() + 5 * 60 * 1000);
  };

  const getPredictedEngagement = async (notification: Partial<SmartNotification>): Promise<number> => {
    try {
      const response = await fetch('/api/ai/smart-notifications/predict-engagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          notification,
          context: {
            currentTime: new Date().toISOString(),
            userActivity: notifications.slice(0, 10) // Recent activity
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.predictedEngagement || 0.5;
      }
    } catch (error) {
      console.error('Failed to predict engagement:', error);
    }

    return 0.5; // Default engagement rate
  };

  const getPersonalizedContent = async (template: string, context: any): Promise<string> => {
    try {
      const response = await fetch('/api/ai/smart-notifications/personalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          template,
          context,
          preferences
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.personalizedContent || template;
      }
    } catch (error) {
      console.error('Failed to personalize content:', error);
    }

    return template; // Fallback to original template
  };

  const refresh = async (): Promise<void> => {
    await loadInitialData();
  };

  const clearError = () => {
    setError(null);
  };

  const cleanup = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    // Notifications
    notifications,
    unreadCount,
    isLoading,
    error,
    
    // Preferences
    preferences,
    updatePreferences,
    
    // Analytics
    analytics,
    optimizationSuggestions,
    
    // Actions
    sendNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    scheduleNotification,
    
    // Smart features
    optimizeDeliveryTiming,
    getPredictedEngagement,
    getPersonalizedContent,
    
    // Utilities
    refresh,
    clearError
  };
}