import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  _id: string;
  userId: Types.ObjectId;
  type: 'booking' | 'payment' | 'verification' | 'system' | 'promotional' | 'reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'info' | 'success' | 'warning' | 'error';
  
  // Content and actions
  data?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
  
  // Delivery and status
  deliveryMethods: ('in_app' | 'push' | 'email' | 'sms')[];
  sentAt?: Date;
  readAt?: Date;
  clickedAt?: Date;
  
  // Scheduling
  scheduledFor?: Date;
  expiresAt?: Date;
  
  // Related entities
  relatedId?: Types.ObjectId;
  relatedType?: 'booking' | 'payment' | 'verification' | 'service' | 'provider' | 'user';
  
  // Metadata
  source: 'system' | 'user' | 'provider' | 'admin';
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['booking', 'payment', 'verification', 'system', 'promotional', 'reminder'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  message: {
    type: String,
    required: true,
    maxlength: 500,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  category: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info',
  },
  
  // Content and actions
  data: {
    type: Schema.Types.Mixed,
    default: {},
  },
  actionUrl: {
    type: String,
    maxlength: 500,
  },
  actionText: {
    type: String,
    maxlength: 50,
  },
  
  // Delivery and status
  deliveryMethods: [{
    type: String,
    enum: ['in_app', 'push', 'email', 'sms'],
    default: ['in_app'],
  }],
  sentAt: {
    type: Date,
  },
  readAt: {
    type: Date,
  },
  clickedAt: {
    type: Date,
  },
  
  // Scheduling
  scheduledFor: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
  
  // Related entities
  relatedId: {
    type: Schema.Types.ObjectId,
  },
  relatedType: {
    type: String,
    enum: ['booking', 'payment', 'verification', 'service', 'provider', 'user'],
  },
  
  // Metadata
  source: {
    type: String,
    enum: ['system', 'user', 'provider', 'admin'],
    default: 'system',
  },
  tags: [{
    type: String,
    maxlength: 50,
  }],
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
NotificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for performance
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, readAt: 1 });
NotificationSchema.index({ userId: 1, priority: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ scheduledFor: 1, sentAt: 1 });
NotificationSchema.index({ expiresAt: 1 });

// Virtual for notification age
NotificationSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for isRead
NotificationSchema.virtual('isRead').get(function() {
  return !!this.readAt;
});

// Virtual for isExpired
NotificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt ? Date.now() > this.expiresAt.getTime() : false;
});

// Virtual for isScheduled
NotificationSchema.virtual('isScheduled').get(function() {
  return this.scheduledFor ? Date.now() < this.scheduledFor.getTime() : false;
});

// Methods
NotificationSchema.methods.markAsRead = function() {
  this.readAt = new Date();
  return this.save();
};

NotificationSchema.methods.markAsClicked = function() {
  this.clickedAt = new Date();
  return this.save();
};

NotificationSchema.methods.markAsSent = function() {
  this.sentAt = new Date();
  return this.save();
};

// Static methods
NotificationSchema.statics.findUnreadByUser = function(userId: string) {
  return this.find({ userId, readAt: { $exists: false } }).sort({ createdAt: -1 });
};

NotificationSchema.statics.findByUser = function(userId: string, limit = 50, offset = 0) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset);
};

NotificationSchema.statics.findPendingScheduled = function() {
  return this.find({
    scheduledFor: { $lte: new Date() },
    sentAt: { $exists: false },
    expiresAt: { $gt: new Date() }
  });
};

NotificationSchema.statics.findExpired = function() {
  return this.find({
    expiresAt: { $lte: new Date() }
  });
};

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
