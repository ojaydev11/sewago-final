import mongoose, { Schema, InferSchemaType } from "mongoose";

const bookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "Provider" },
    
    // Enhanced booking types
    bookingType: {
      type: String,
      enum: ["STANDARD", "GROUP", "RECURRING", "SMART_SCHEDULED", "URGENT"],
      default: "STANDARD"
    },
    
    // Group booking support
    groupBooking: {
      isGroup: { type: Boolean, default: false },
      groupId: { type: String },
      participants: [{
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        name: { type: String },
        email: { type: String },
        phone: { type: String },
        shareAmount: { type: Number },
        hasPaid: { type: Boolean, default: false }
      }],
      splitMethod: {
        type: String,
        enum: ["EQUAL", "PERCENTAGE", "CUSTOM", "BY_SERVICE"],
        default: "EQUAL"
      },
      groupDiscount: { type: Number, default: 0 }
    },
    
    // Smart scheduling with slot management
    smartScheduling: {
      enabled: { type: Boolean, default: false },
      preferredTimes: [{
        start: { type: String },
        end: { type: String },
        priority: { type: Number, min: 1, max: 5 }
      }],
      weatherSensitive: { type: Boolean, default: false },
      trafficOptimized: { type: Boolean, default: true },
      flexibilityHours: { type: Number, default: 24 }
    },
    
    // Enhanced recurring bookings
    recurring: {
      isRecurring: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ["WEEKLY", "BIWEEKLY", "MONTHLY", "CUSTOM"]
      },
      interval: { type: Number, min: 1, max: 12, default: 1 },
      startDate: { type: Date },
      endDate: { type: Date },
      nextOccurrence: { type: Date },
      occurrences: [{
        date: { type: Date, required: true },
        status: {
          type: String,
          enum: ["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED", "SKIPPED"],
          default: "SCHEDULED"
        },
        bookingId: { type: Schema.Types.ObjectId, ref: "Booking" } // Reference to individual booking
      }],
      skipNext: { type: Boolean, default: false },
      modifyNext: { type: Boolean, default: false }
    },
    
    // Slot management and availability
    slot: {
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
      duration: { type: Number, required: true }, // in minutes
      isLocked: { type: Boolean, default: false },
      lockExpiresAt: { type: Date }, // 120s slot hold
      lockId: { type: String }, // Unique lock identifier
      timezone: { type: String, default: "Asia/Kathmandu" }
    },
    
    // Rescheduling support
    rescheduling: {
      isRescheduled: { type: Boolean, default: false },
      originalSlot: {
        startTime: { type: Date },
        endTime: { type: Date }
      },
      rescheduledAt: { type: Date },
      rescheduledBy: { type: Schema.Types.ObjectId, ref: "User" },
      rescheduleReason: { type: String },
      rescheduleCount: { type: Number, default: 0 },
      maxReschedules: { type: Number, default: 3 }
    },
    
    status: {
      type: String,
      enum: [
        "PENDING_CONFIRMATION",
        "CONFIRMED", 
        "PROVIDER_ASSIGNED",
        "EN_ROUTE",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELED",
        "DISPUTED",
        "RESCHEDULED"
      ],
      default: "PENDING_CONFIRMATION",
    },
    
    // Enhanced location and service details
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    notes: { type: String },
    
    // Enhanced pricing and payment
    basePrice: { type: Number, required: true },
    total: { type: Number, required: true },
    paid: { type: Boolean, default: false },
    paymentMethod: { type: String },
    paymentPlan: {
      type: String,
      enum: ["FULL", "PARTIAL", "BNPL", "WALLET"],
      default: "FULL"
    },
    walletCredit: { type: Number, default: 0 },
    
    // Scheduling
    scheduledAt: { type: Date },
    estimatedDuration: { type: Number }, // in minutes
    urgency: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "EMERGENCY"],
      default: "MEDIUM"
    },
    
    // Quality control
    qualityRating: { type: Number, min: 1, max: 5 },
    serviceGuarantee: { type: Boolean, default: true },
    satisfactionSurvey: {
      completed: { type: Boolean, default: false },
      rating: { type: Number, min: 1, max: 5 },
      feedback: { type: String }
    },
    
    completedAt: { type: Date },
    
    // Referral tracking
    referralCode: { type: String },
    referredBy: { type: Schema.Types.ObjectId, ref: "User" },
    
    // Analytics
    bookingSource: {
      type: String,
      enum: ["WEB", "MOBILE", "VOICE", "REFERRAL", "SOCIAL"],
      default: "WEB"
    },
    
    // Conflict resolution
    conflicts: [{
      conflictingBookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
      conflictType: {
        type: String,
        enum: ["TIME_OVERLAP", "PROVIDER_UNAVAILABLE", "SERVICE_CONFLICT"]
      },
      resolvedAt: { type: Date },
      resolutionMethod: {
        type: String,
        enum: ["RESCHEDULED", "CANCELLED", "PROVIDER_CHANGED", "AUTO_RESOLVED"]
      }
    }]
  },
  { timestamps: true }
);

// Indexes for performance and slot management
bookingSchema.index({ userId: 1 });
bookingSchema.index({ providerId: 1 });
bookingSchema.index({ status: 1, createdAt: 1 });
bookingSchema.index({ "groupBooking.groupId": 1 });
bookingSchema.index({ scheduledAt: 1 });
bookingSchema.index({ "recurring.nextOccurrence": 1 });
bookingSchema.index({ coordinates: "2dsphere" });
bookingSchema.index({ "slot.startTime": 1, "slot.endTime": 1 });
bookingSchema.index({ "slot.lockId": 1 });
bookingSchema.index({ "slot.isLocked": 1, "slot.lockExpiresAt": 1 });
bookingSchema.index({ "recurring.occurrences.date": 1 });

// Pre-save middleware to handle slot locking
bookingSchema.pre('save', function(next) {
  if (this.isModified('slot.startTime') || this.isModified('slot.endTime')) {
    // Calculate duration when slot times change
    if (this.slot?.startTime && this.slot?.endTime) {
      this.slot.duration = Math.round((this.slot.endTime.getTime() - this.slot.startTime.getTime()) / (1000 * 60));
    }
  }
  next();
});

// Method to check if slot is available
bookingSchema.methods.isSlotAvailable = function() {
  if (!this.slot?.startTime || !this.slot?.endTime) return false;
  if (this.slot.isLocked && this.slot.lockExpiresAt && new Date() < this.slot.lockExpiresAt) return false;
  return true;
};

// Method to lock slot
bookingSchema.methods.lockSlot = function(lockDurationMs: number = 120000) { // Default 120s
  if (!this.slot) return false;
  
  this.slot.isLocked = true;
  this.slot.lockExpiresAt = new Date(Date.now() + lockDurationMs);
  this.slot.lockId = `lock_${this._id}_${Date.now()}`;
  return true;
};

// Method to unlock slot
bookingSchema.methods.unlockSlot = function() {
  if (!this.slot) return false;
  
  this.slot.isLocked = false;
  this.slot.lockExpiresAt = undefined;
  this.slot.lockId = undefined;
  return true;
};

// Method to check if booking can be rescheduled
bookingSchema.methods.canReschedule = function() {
  if (this.status === 'COMPLETED' || this.status === 'CANCELED') return false;
  if (this.rescheduling.rescheduleCount >= this.rescheduling.maxReschedules) return false;
  if (this.slot.startTime && new Date() >= this.slot.startTime) return false;
  return true;
};

// Method to reschedule booking
bookingSchema.methods.reschedule = function(newStartTime: Date, newEndTime: Date, reason?: string, rescheduledBy?: string) {
  if (!this.canReschedule()) return false;
  
  // Store original slot
  this.rescheduling.originalSlot = {
    startTime: this.slot.startTime,
    endTime: this.slot.endTime
  };
  
  // Update slot
  this.slot.startTime = newStartTime;
  this.slot.endTime = newEndTime;
  this.slot.duration = Math.round((newEndTime.getTime() - newStartTime.getTime()) / (1000 * 60));
  
  // Update rescheduling info
  this.rescheduling.isRescheduled = true;
  this.rescheduling.rescheduledAt = new Date();
  this.rescheduling.rescheduledBy = rescheduledBy;
  this.rescheduling.rescheduleReason = reason;
  this.rescheduling.rescheduleCount += 1;
  
  // Update status
  this.status = 'RESCHEDULED';
  
  return true;
};

export type BookingDocument = InferSchemaType<typeof bookingSchema> & {
  _id: mongoose.Types.ObjectId;
  isSlotAvailable(): boolean;
  lockSlot(lockDurationMs?: number): boolean;
  unlockSlot(): boolean;
  canReschedule(): boolean;
  reschedule(newStartTime: Date, newEndTime: Date, reason?: string, rescheduledBy?: string): boolean;
};

export const BookingModel = mongoose.model("Booking", bookingSchema);


