// import { Notification, INotification } from '@/models/Notification';
import { Server as SocketIOServer } from 'socket.io';

export interface CreateNotificationData {
  userId: string;
  type: INotification['type'];
  title: string;
  message: string;
  priority?: INotification['priority'];
  category?: INotification['category'];
  data?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
  deliveryMethods?: INotification['deliveryMethods'];
  scheduledFor?: Date;
  expiresAt?: Date;
  relatedId?: string;
  relatedType?: INotification['relatedType'];
  source?: INotification['source'];
  tags?: string[];
}

export interface NotificationFilters {
  userId: string;
  type?: INotification['type'];
  priority?: INotification['priority'];
  category?: INotification['category'];
  read?: boolean;
  limit?: number;
  offset?: number;
}

export class NotificationService {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Create a new notification
   */
  async createNotification(data: CreateNotificationData): Promise<INotification> {
    try {
      const notification = new Notification({
        ...data,
        deliveryMethods: data.deliveryMethods || ['in_app'],
        priority: data.priority || 'medium',
        category: data.category || 'info',
        source: data.source || 'system',
        tags: data.tags || [],
      });

      const savedNotification = await notification.save();

      // Send real-time notification if it's not scheduled
      if (!data.scheduledFor || data.scheduledFor <= new Date()) {
        await this.sendRealTimeNotification(savedNotification);
      }

      return savedNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Create multiple notifications for multiple users
   */
  async createBulkNotifications(
    notifications: CreateNotificationData[]
  ): Promise<INotification[]> {
    try {
      const createdNotifications = await Promise.all(
        notifications.map(data => this.createNotification(data))
      );
      return createdNotifications;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw new Error('Failed to create bulk notifications');
    }
  }

  /**
   * Send notification to all users
   */
  async createSystemNotification(
    data: Omit<CreateNotificationData, 'userId'>
  ): Promise<void> {
    try {
      // Get all user IDs (you might want to implement pagination for large user bases)
      // For now, we'll assume you have a way to get all user IDs
      const userIds = await this.getAllUserIds();
      
      const notifications = userIds.map(userId => ({
        ...data,
        userId,
        source: 'system' as const,
      }));

      await this.createBulkNotifications(notifications);
    } catch (error) {
      console.error('Error creating system notification:', error);
      throw new Error('Failed to create system notification');
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(filters: NotificationFilters): Promise<{
    notifications: INotification[];
    total: number;
    unreadCount: number;
  }> {
    try {
      const { userId, type, priority, category, read, limit = 50, offset = 0 } = filters;

      // Build query
      const query: any = { userId };
      
      if (type) query.type = type;
      if (priority) query.priority = priority;
      if (category) query.category = category;
      if (read !== undefined) {
        if (read) {
          query.readAt = { $exists: true };
        } else {
          query.readAt = { $exists: false };
        }
      }

      // Get notifications
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);

      // Get total count
      const total = await Notification.countDocuments(query);

      // Get unread count
      const unreadCount = await Notification.countDocuments({
        userId,
        readAt: { $exists: false }
      });

      return { notifications, total, unreadCount };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw new Error('Failed to get user notifications');
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await Notification.updateMany(
        { userId, readAt: { $exists: false } },
        { readAt: new Date() }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  /**
   * Mark notification as clicked
   */
  async markAsClicked(notificationId: string, userId: string): Promise<void> {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { clickedAt: new Date() },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found');
      }
    } catch (error) {
      console.error('Error marking notification as clicked:', error);
      throw new Error('Failed to mark notification as clicked');
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const result = await Notification.deleteOne({ _id: notificationId, userId });
      
      if (result.deletedCount === 0) {
        throw new Error('Notification not found');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  /**
   * Send real-time notification via Socket.IO
   */
  private async sendRealTimeNotification(notification: INotification): Promise<void> {
    try {
      // Emit to the specific user's room
      this.io.to(`user:${notification.userId}`).emit('notification:new', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        category: notification.category,
        data: notification.data,
        actionUrl: notification.actionUrl,
        actionText: notification.actionText,
        createdAt: notification.createdAt,
        tags: notification.tags,
      });

      // Mark as sent
      await notification.markAsSent();
    } catch (error) {
      console.error('Error sending real-time notification:', error);
    }
  }

  /**
   * Process scheduled notifications
   */
  async processScheduledNotifications(): Promise<void> {
    try {
      const pendingNotifications = await Notification.findPendingScheduled();
      
      for (const notification of pendingNotifications) {
        await this.sendRealTimeNotification(notification);
      }
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
    }
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      const expiredNotifications = await Notification.findExpired();
      
      for (const notification of expiredNotifications) {
        await notification.deleteOne();
      }
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
    }
  }

  /**
   * Get notification statistics for a user
   */
  async getUserNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    try {
      const [total, unread, typeStats, priorityStats] = await Promise.all([
        Notification.countDocuments({ userId }),
        Notification.countDocuments({ userId, readAt: { $exists: false } }),
        Notification.aggregate([
          { $match: { userId } },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        Notification.aggregate([
          { $match: { userId } },
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ])
      ]);

      const byType = typeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>);

      const byPriority = priorityStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>);

      return { total, unread, byType, byPriority };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw new Error('Failed to get notification stats');
    }
  }

  /**
   * Helper method to get all user IDs
   * This should be implemented based on your user management system
   */
  private async getAllUserIds(): Promise<string[]> {
    // This is a placeholder - implement based on your user model
    // For example, if using Mongoose:
    // const users = await User.find({}, '_id');
    // return users.map(user => user._id.toString());
    
    // For now, return empty array to avoid errors
    return [];
  }
}

// Export singleton instance
export const notificationService = new NotificationService(null as any);

// Export function to initialize with Socket.IO instance
export function initializeNotificationService(io: SocketIOServer): NotificationService {
  return new NotificationService(io);
}
