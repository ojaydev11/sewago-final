'use client';
import 'client-only';

import { FEATURE_FLAGS } from './featureFlags';

export interface MockNotification {
  id: string;
  type: 'booking' | 'payment' | 'verification' | 'system' | 'promotional' | 'reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  readAt?: string;
  clickedAt?: string;
}

export interface MockNotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

// Mock data for development
const mockNotifications: MockNotification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your service booking has been confirmed for tomorrow at 2:00 PM',
    priority: 'medium',
    category: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Successful',
    message: 'Your payment of Rs 1500 has been processed successfully',
    priority: 'medium',
    category: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: '3',
    type: 'verification',
    title: 'Verification Pending',
    message: 'Your account verification is under review. This usually takes 24-48 hours.',
    priority: 'high',
    category: 'warning',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: '4',
    type: 'system',
    title: 'Welcome to SewaGo!',
    message: 'Thank you for joining our platform. We\'re here to help you find the best local services.',
    priority: 'low',
    category: 'info',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export class MockNotificationService {
  private notifications: MockNotification[] = [...mockNotifications];
  private mockSocket: any = null;
  private mockInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (FEATURE_FLAGS.MOCK_MODE) {
      this.startMockSocket();
    }
  }

  private startMockSocket() {
    // Simulate real-time notifications every 10 seconds
    this.mockInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new notification
        this.createMockNotification();
      }
    }, 10000);
  }

  private createMockNotification() {
    const mockTypes = ['booking', 'payment', 'verification', 'system'] as const;
    const mockPriorities = ['low', 'medium', 'high'] as const;
    const mockCategories = ['info', 'success', 'warning'] as const;

    const newNotification: MockNotification = {
      id: Date.now().toString(),
      type: mockTypes[Math.floor(Math.random() * mockTypes.length)],
      title: `Mock ${mockTypes[Math.floor(Math.random() * mockTypes.length)]} Update`,
      message: `This is a mock notification for testing purposes. Generated at ${new Date().toLocaleTimeString()}`,
      priority: mockPriorities[Math.floor(Math.random() * mockPriorities.length)],
      category: mockCategories[Math.floor(Math.random() * mockCategories.length)],
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(newNotification);

    // Emit mock socket event if available
    if (this.mockSocket && this.mockSocket.emit) {
      this.mockSocket.emit('notification:new', newNotification);
    }

    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('mockNotification', { detail: newNotification }));
  }

  async getUserNotifications(filters: any = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    let filteredNotifications = [...this.notifications];

    // Apply filters
    if (filters.type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === filters.type);
    }
    if (filters.priority) {
      filteredNotifications = filteredNotifications.filter(n => n.priority === filters.priority);
    }
    if (filters.category) {
      filteredNotifications = filteredNotifications.filter(n => n.category === filters.category);
    }
    if (filters.read !== undefined) {
      if (filters.read) {
        filteredNotifications = filteredNotifications.filter(n => n.readAt);
      } else {
        filteredNotifications = filteredNotifications.filter(n => !n.readAt);
      }
    }

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    const paginatedNotifications = filteredNotifications.slice(offset, offset + limit);

    const unreadCount = this.notifications.filter(n => !n.readAt).length;

    return {
      notifications: paginatedNotifications,
      total: filteredNotifications.length,
      unreadCount,
    };
  }

  async getUserNotificationStats() {
    await new Promise(resolve => setTimeout(resolve, 50));

    const total = this.notifications.length;
    const unread = this.notifications.filter(n => !n.readAt).length;

    const byType = this.notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = this.notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, unread, byType, byPriority };
  }

  async markAsRead(notificationId: string) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.readAt = new Date().toISOString();
    }
  }

  async markAllAsRead() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    this.notifications.forEach(n => {
      if (!n.readAt) {
        n.readAt = new Date().toISOString();
      }
    });
  }

  async markAsClicked(notificationId: string) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.clickedAt = new Date().toISOString();
    }
  }

  async deleteNotification(notificationId: string) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }

  async createNotification(data: any) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newNotification: MockNotification = {
      id: Date.now().toString(),
      type: data.type || 'system',
      title: data.title || 'New Notification',
      message: data.message || 'Notification message',
      priority: data.priority || 'medium',
      category: data.category || 'info',
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(newNotification);
    return newNotification;
  }

  destroy() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
  }
}

// Export singleton instance
export const mockNotificationService = new MockNotificationService();
