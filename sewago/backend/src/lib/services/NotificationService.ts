import { NotificationModel } from "../../models/Notification.js";
import { emitToUser } from "../../socket-server.js";

export interface NotificationData {
  userId?: string;
  providerId?: string;
  bookingId?: string;
  message: string;
  type: string;
  channel: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private io: any;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public setSocketIO(io: any) {
    this.io = io;
  }

  /**
   * Send notification to a user
   */
  async sendToUser(userId: string, message: string, type: string = "general", channel: string = "push", bookingId?: string): Promise<void> {
    try {
      // Create notification record in database
      const notification = await NotificationModel.create({
        userId,
        message,
        type,
        channel,
        bookingId,
      });

      // Send real-time notification via WebSocket
      if (this.io) {
        emitToUser(this.io, userId, "notification", {
          id: notification._id,
          message,
          type,
          channel,
          sentAt: notification.sentAt,
        });
      }

      // Send via external service based on channel
      await this.sendExternalNotification(userId, message, channel);

      console.log(`Notification sent to user ${userId}: ${message}`);
    } catch (error) {
      console.error("Error sending notification to user:", error);
      throw error;
    }
  }

  /**
   * Send notification to a provider
   */
  async sendToProvider(providerId: string, message: string, type: string = "general", channel: string = "push", bookingId?: string): Promise<void> {
    try {
      // Create notification record in database
      const notification = await NotificationModel.create({
        providerId,
        message,
        type,
        channel,
        bookingId,
      });

      // Send real-time notification via WebSocket
      if (this.io) {
        emitToUser(this.io, providerId, "notification", {
          id: notification._id,
          message,
          type,
          channel,
          sentAt: notification.sentAt,
        });
      }

      // Send via external service based on channel
      await this.sendExternalNotification(providerId, message, channel);

      console.log(`Notification sent to provider ${providerId}: ${message}`);
    } catch (error) {
      console.error("Error sending notification to provider:", error);
      throw error;
    }
  }

  /**
   * Send notification to both user and provider for a booking
   */
  async sendBookingNotification(
    userId: string,
    providerId: string,
    message: string,
    type: string = "booking_update",
    channel: string = "push",
    bookingId: string
  ): Promise<void> {
    try {
      await Promise.all([
        this.sendToUser(userId, message, type, channel, bookingId),
        this.sendToProvider(providerId, message, type, channel, bookingId),
      ]);
    } catch (error) {
      console.error("Error sending booking notification:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await NotificationModel.findByIdAndUpdate(notificationId, {
        readAt: new Date(),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      return await NotificationModel.find({ userId })
        .sort({ sentAt: -1 })
        .limit(limit)
        .skip(offset)
        .populate("bookingId", "id status serviceId");
    } catch (error) {
      console.error("Error getting user notifications:", error);
      throw error;
    }
  }

  /**
   * Get provider notifications
   */
  async getProviderNotifications(providerId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      return await NotificationModel.find({ providerId })
        .sort({ sentAt: -1 })
        .limit(limit)
        .skip(offset)
        .populate("bookingId", "id status userId");
    } catch (error) {
      console.error("Error getting provider notifications:", error);
      throw error;
    }
  }

  /**
   * Send notification via external service (SMS, WhatsApp, etc.)
   */
  private async sendExternalNotification(recipientId: string, message: string, channel: string): Promise<void> {
    try {
      switch (channel) {
        case "sms":
          await this.sendSMS(recipientId, message);
          break;
        case "whatsapp":
          await this.sendWhatsApp(recipientId, message);
          break;
        case "email":
          await this.sendEmail(recipientId, message);
          break;
        case "push":
        default:
          // Push notifications are handled via WebSocket
          break;
      }
    } catch (error) {
      console.error(`Error sending ${channel} notification:`, error);
      // Don't throw error here as we still want to save the notification record
    }
  }

  /**
   * Send SMS via Twilio or similar service
   */
  private async sendSMS(recipientId: string, message: string): Promise<void> {
    // TODO: Implement SMS sending via Twilio or similar service
    // This would require adding Twilio SDK and configuration
    console.log(`SMS would be sent to ${recipientId}: ${message}`);
  }

  /**
   * Send WhatsApp message via Twilio or similar service
   */
  private async sendWhatsApp(recipientId: string, message: string): Promise<void> {
    // TODO: Implement WhatsApp sending via Twilio or similar service
    // This would require adding Twilio SDK and configuration
    console.log(`WhatsApp message would be sent to ${recipientId}: ${message}`);
  }

  /**
   * Send email notification
   */
  private async sendEmail(recipientId: string, message: string): Promise<void> {
    // TODO: Implement email sending via SendGrid, AWS SES, or similar service
    console.log(`Email would be sent to ${recipientId}: ${message}`);
  }
}

export default NotificationService;
