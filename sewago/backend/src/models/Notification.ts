import mongoose, { Schema, InferSchemaType } from "mongoose";

const notificationSchema = new Schema(
  {
<<<<<<< HEAD
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    providerId: { type: Schema.Types.ObjectId, ref: "Provider" },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    message: { type: String, required: true },
    type: { type: String, required: true }, // e.g., "booking_update", "payment", "review"
    channel: { type: String, required: true }, // e.g., "sms", "whatsapp", "email", "push"
    sentAt: { type: Date, default: Date.now },
    readAt: { type: Date },
=======
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "Provider" },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    
    // Enhanced notification content
    title: { type: String, required: true },
    message: { type: String, required: true },
    shortMessage: { type: String }, // For SMS/push notifications
    
    // Notification type and category
    type: { 
      type: String, 
      required: true,
      enum: [
        "BOOKING_CREATED", "BOOKING_ACCEPTED", "BOOKING_ARRIVING", "BOOKING_COMPLETED",
        "PAYMENT_SUCCESS", "PAYMENT_FAILED", "PAYMENT_REFUNDED",
        "REVIEW_RECEIVED", "REVIEW_APPROVED", "REVIEW_REJECTED",
        "KYC_APPROVED", "KYC_REJECTED", "KYC_SUBMITTED",
        "WALLET_TOPUP", "WALLET_REFUND", "WALLET_LOW_BALANCE",
        "REFERRAL_SUCCESS", "REFERRAL_BONUS",
        "SYSTEM_UPDATE", "MAINTENANCE", "PROMOTION"
      ]
    },
    
    // Priority and urgency
    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
      default: "NORMAL"
    },
    isUrgent: { type: Boolean, default: false },
    
    // Multi-channel delivery
    channels: [{
      channel: {
        type: String,
        enum: ["IN_APP", "PUSH", "EMAIL", "SMS", "WHATSAPP"],
        required: true
      },
      status: {
        type: String,
        enum: ["PENDING", "SENT", "DELIVERED", "FAILED", "BOUNCED"],
        default: "PENDING"
      },
      sentAt: { type: Date },
      deliveredAt: { type: Date },
      failedAt: { type: Date },
      failureReason: { type: String },
      retryCount: { type: Number, default: 0 },
      maxRetries: { type: Number, default: 3 }
    }],
    
    // Push notification specific fields
    pushNotification: {
      icon: { type: String }, // App icon or custom icon
      badge: { type: Number }, // Badge count
      sound: { type: String, default: "default" },
      clickAction: { type: String }, // Deep link action
      imageUrl: { type: String }, // Rich notification image
      data: { type: Schema.Types.Mixed } // Custom data payload
    },
    
    // Email specific fields
    emailNotification: {
      subject: { type: String },
      templateId: { type: String },
      variables: { type: Schema.Types.Mixed }, // Template variables
      attachments: [{
        filename: { type: String },
        url: { type: String },
        contentType: { type: String }
      }]
    },
    
    // SMS specific fields
    smsNotification: {
      templateId: { type: String },
      variables: { type: Schema.Types.Mixed }
    },
    
    // Delivery tracking
    deliveryStatus: {
      type: String,
      enum: ["PENDING", "PARTIALLY_DELIVERED", "DELIVERED", "FAILED"],
      default: "PENDING"
    },
    deliveredAt: { type: Date },
    failedAt: { type: Date },
    
    // User interaction
    readAt: { type: Date },
    clickedAt: { type: Date },
    dismissedAt: { type: Date },
    actionTaken: { type: String }, // What user did with notification
    
    // Scheduling and expiration
    scheduledFor: { type: Date }, // For scheduled notifications
    expiresAt: { type: Date }, // When notification expires
    isExpired: { type: Boolean, default: false },
    
    // Analytics and tracking
    openRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 },
    deliveryRate: { type: Number, default: 0 },
    
    // Metadata
    metadata: { type: Schema.Types.Mixed }, // Additional data
    tags: [{ type: String }], // For categorization and filtering
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
  },
  { timestamps: true }
);

<<<<<<< HEAD
notificationSchema.index({ userId: 1, sentAt: -1 });
notificationSchema.index({ providerId: 1, sentAt: -1 });
notificationSchema.index({ bookingId: 1, sentAt: -1 });
notificationSchema.index({ readAt: 1 });

export type NotificationDocument = InferSchemaType<typeof notificationSchema> & {
  _id: mongoose.Types.ObjectId;
=======
// Indexes for performance and querying
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ providerId: 1, createdAt: -1 });
notificationSchema.index({ bookingId: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ "deliveryStatus": 1 });
notificationSchema.index({ "channels.status": 1 });
notificationSchema.index({ "scheduledFor": 1 });
notificationSchema.index({ "expiresAt": 1 });
notificationSchema.index({ "readAt": 1 });
notificationSchema.index({ tags: 1 });

// Pre-save middleware to handle scheduling and expiration
notificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Check if notification is expired
  if (this.expiresAt && new Date() > this.expiresAt) {
    this.isExpired = true;
  }
  
  // Calculate delivery status based on channels
  if (this.channels && this.channels.length > 0) {
    const deliveredChannels = this.channels.filter((ch: any) => ch.status === "DELIVERED").length;
    const failedChannels = this.channels.filter((ch: any) => ch.status === "FAILED").length;
    const totalChannels = this.channels.length;
    
    if (failedChannels === totalChannels) {
      this.deliveryStatus = "FAILED";
      this.failedAt = new Date();
    } else if (deliveredChannels > 0) {
      this.deliveryStatus = deliveredChannels === totalChannels ? "DELIVERED" : "PARTIALLY_DELIVERED";
      if (deliveredChannels === totalChannels && !this.deliveredAt) {
        this.deliveredAt = new Date();
      }
    }
  }
  
  next();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.readAt = new Date();
  return this.save();
};

// Method to mark as clicked
notificationSchema.methods.markAsClicked = function() {
  this.clickedAt = new Date();
  return this.save();
};

// Method to dismiss notification
notificationSchema.methods.dismiss = function() {
  this.dismissedAt = new Date();
  return this.save();
};

// Method to update channel status
notificationSchema.methods.updateChannelStatus = function(channel: string, status: string, additionalData?: any) {
  const channelObj = this.channels.find((ch: any) => ch.channel === channel);
  if (!channelObj) return false;
  
  channelObj.status = status;
  
  if (status === "SENT") {
    channelObj.sentAt = new Date();
  } else if (status === "DELIVERED") {
    channelObj.deliveredAt = new Date();
  } else if (status === "FAILED") {
    channelObj.failedAt = new Date();
    if (additionalData?.failureReason) {
      channelObj.failureReason = additionalData.failureReason;
    }
  }
  
  if (additionalData?.retryCount !== undefined) {
    channelObj.retryCount = additionalData.retryCount;
  }
  
  return this.save();
};

// Method to retry failed delivery
notificationSchema.methods.retryDelivery = function(channel: string) {
  const channelObj = this.channels.find((ch: any) => ch.channel === channel);
  if (!channelObj || channelObj.retryCount >= channelObj.maxRetries) return false;
  
  channelObj.status = "PENDING";
  channelObj.retryCount += 1;
  channelObj.failedAt = undefined;
  channelObj.failureReason = undefined;
  
  return this.save();
};

// Static method to get unread notifications
notificationSchema.statics.getUnreadNotifications = function(userId: string, limit: number = 50) {
  return this.find({
    userId,
    readAt: { $exists: false },
    isExpired: false
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get notifications by type
notificationSchema.statics.getNotificationsByType = function(userId: string, type: string, limit: number = 20) {
  return this.find({
    userId,
    type,
    isExpired: false
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get expired notifications for cleanup
notificationSchema.statics.getExpiredNotifications = function() {
  return this.find({
    expiresAt: { $lt: new Date() },
    isExpired: false
  });
};

export type NotificationDocument = InferSchemaType<typeof notificationSchema> & {
  _id: mongoose.Types.ObjectId;
  markAsRead(): Promise<any>;
  markAsClicked(): Promise<any>;
  dismiss(): Promise<any>;
  updateChannelStatus(channel: string, status: string, additionalData?: any): Promise<any>;
  retryDelivery(channel: string): Promise<any>;
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
};

export const NotificationModel = mongoose.model("Notification", notificationSchema);
