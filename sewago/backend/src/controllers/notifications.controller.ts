import { Request, Response } from "express";
import { NotificationModel } from "../models/Notification.js";
import { UserModel } from "../models/User.js";
import { v4 as uuidv4 } from "uuid";

// Get user notifications
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20, type, unreadOnly = false } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = { userId, isExpired: false };

    if (type) filter.type = type;
    if (unreadOnly === "true") filter.readAt = { $exists: false };

    const notifications = await NotificationModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await NotificationModel.countDocuments(filter);

    // Get unread count
    const unreadCount = await NotificationModel.countDocuments({
      userId,
      readAt: { $exists: false },
      isExpired: false
    });

    res.json({
      success: true,
      notifications: notifications.map(notification => ({
        id: notification._id,
        title: notification.title,
        message: notification.message,
        shortMessage: notification.shortMessage,
        type: notification.type,
        priority: notification.priority,
        isUrgent: notification.isUrgent,
        channels: notification.channels,
        deliveryStatus: notification.deliveryStatus,
        readAt: notification.readAt,
        clickedAt: notification.clickedAt,
        dismissedAt: notification.dismissedAt,
        createdAt: notification.createdAt,
        metadata: notification.metadata,
        tags: notification.tags
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      unreadCount
    });
  } catch (error) {
    console.error("Error getting user notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notification = await NotificationModel.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: "Notification marked as read",
      notification: {
        id: notification._id,
        readAt: notification.readAt
      }
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await NotificationModel.updateMany(
      {
        userId,
        readAt: { $exists: false },
        isExpired: false
      },
      {
        $set: { readAt: new Date() }
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark notification as clicked
export const markNotificationAsClicked = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notification = await NotificationModel.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.markAsClicked();

    res.json({
      success: true,
      message: "Notification marked as clicked",
      notification: {
        id: notification._id,
        clickedAt: notification.clickedAt
      }
    });
  } catch (error) {
    console.error("Error marking notification as clicked:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Dismiss notification
export const dismissNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notification = await NotificationModel.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.dismiss();

    res.json({
      success: true,
      message: "Notification dismissed",
      notification: {
        id: notification._id,
        dismissedAt: notification.dismissedAt
      }
    });
  } catch (error) {
    console.error("Error dismissing notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { 
      email, 
      sms, 
      push, 
      inApp,
      language,
      timezone 
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update notification preferences
    if (user.preferences) {
      if (email !== undefined) user.preferences.notifications.email = email;
      if (sms !== undefined) user.preferences.notifications.sms = sms;
      if (push !== undefined) user.preferences.notifications.push = push;
      if (inApp !== undefined) user.preferences.notifications.inApp = inApp;
      if (language) user.preferences.language = language;
      if (timezone) user.preferences.timezone = timezone;
    } else {
      user.preferences = {
        language: language || "en",
        currency: "NPR",
        timezone: timezone || "Asia/Kathmandu",
        notifications: {
          email: email !== undefined ? email : true,
          sms: sms !== undefined ? sms : true,
          push: push !== undefined ? push : true,
          inApp: inApp !== undefined ? inApp : true
        }
      };
    }

    await user.save();

    res.json({
      success: true,
      message: "Notification preferences updated",
      preferences: user.preferences
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get notification preferences
export const getNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId).select("preferences");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      preferences: user.preferences || {
        language: "en",
        currency: "NPR",
        timezone: "Asia/Kathmandu",
        notifications: {
          email: true,
          sms: true,
          push: true,
          inApp: true
        }
      }
    });
  } catch (error) {
    console.error("Error getting notification preferences:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send test notification
export const sendTestNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { type = "SYSTEM_UPDATE", channel = "IN_APP" } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const testNotification = await NotificationModel.create({
      userId,
      title: "Test Notification",
      message: "This is a test notification to verify your settings.",
      shortMessage: "Test notification",
      type,
      priority: "LOW",
      channels: [
        { channel, status: "PENDING" }
      ],
      metadata: {
        isTest: true,
        sentAt: new Date()
      },
      tags: ["test", "verification"]
    });

    res.json({
      success: true,
      message: "Test notification sent",
      notification: {
        id: testNotification._id,
        title: testNotification.title,
        message: testNotification.message,
        type: testNotification.type,
        channel: channel
      }
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get notification statistics
export const getNotificationStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const filter: any = { userId };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const stats = await NotificationModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalNotifications: { $sum: 1 },
          readNotifications: { $sum: { $cond: [{ $exists: ["$readAt"] }, 1, 0] } },
          clickedNotifications: { $sum: { $cond: [{ $exists: ["$clickedAt"] }, 1, 0] } },
          dismissedNotifications: { $sum: { $cond: [{ $exists: ["$dismissedAt"] }, 1, 0] } },
          deliverySuccess: { $sum: { $cond: [{ $eq: ["$deliveryStatus", "DELIVERED"] }, 1, 0] } },
          deliveryFailed: { $sum: { $cond: [{ $eq: ["$deliveryStatus", "FAILED"] }, 1, 0] } }
        }
      }
    ]);

    const channelStats = await NotificationModel.aggregate([
      { $match: filter },
      { $unwind: "$channels" },
      {
        $group: {
          _id: "$channels.channel",
          total: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ["$channels.status", "DELIVERED"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$channels.status", "FAILED"] }, 1, 0] } }
        }
      }
    ]);

    const typeStats = await NotificationModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const result = stats[0] || {
      totalNotifications: 0,
      readNotifications: 0,
      clickedNotifications: 0,
      dismissedNotifications: 0,
      deliverySuccess: 0,
      deliveryFailed: 0
    };

    res.json({
      success: true,
      stats: {
        ...result,
        readRate: result.totalNotifications > 0 ? (result.readNotifications / result.totalNotifications * 100).toFixed(2) : 0,
        clickRate: result.totalNotifications > 0 ? (result.clickedNotifications / result.totalNotifications * 100).toFixed(2) : 0,
        deliveryRate: result.totalNotifications > 0 ? (result.deliverySuccess / result.totalNotifications * 100).toFixed(2) : 0
      },
      channelStats,
      typeStats
    });
  } catch (error) {
    console.error("Error getting notification stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin: Get system-wide notification statistics
export const getSystemNotificationStats = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { startDate, endDate } = req.query;
    const filter: any = {};
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const stats = await NotificationModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalNotifications: { $sum: 1 },
          totalUsers: { $addToSet: "$userId" },
          deliverySuccess: { $sum: { $cond: [{ $eq: ["$deliveryStatus", "DELIVERED"] }, 1, 0] } },
          deliveryFailed: { $sum: { $cond: [{ $eq: ["$deliveryStatus", "FAILED"] }, 1, 0] } },
          avgDeliveryRate: { $avg: "$deliveryRate" }
        }
      }
    ]);

    const result = stats[0] || {
      totalNotifications: 0,
      totalUsers: [],
      deliverySuccess: 0,
      deliveryFailed: 0,
      avgDeliveryRate: 0
    };

    res.json({
      success: true,
      stats: {
        totalNotifications: result.totalNotifications,
        uniqueUsers: result.totalUsers.length,
        deliverySuccess: result.deliverySuccess,
        deliveryFailed: result.deliveryFailed,
        deliveryRate: result.totalNotifications > 0 ? (result.deliverySuccess / result.totalNotifications * 100).toFixed(2) : 0,
        avgDeliveryRate: Math.round(result.avgDeliveryRate * 100) / 100
      }
    });
  } catch (error) {
    console.error("Error getting system notification stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
