import mongoose, { Schema, InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "provider", "admin"], default: "user" },
    avatarUrl: { type: String },
    
    // Enhanced provider information
    provider: {
      businessName: { type: String },
      categories: [{ type: String }],
      description: { type: String },
      baseLocation: { type: String },
      pricePerHour: { type: Number },
      rating: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
      isVerified: { type: Boolean, default: false },
      
      // KYC and approval status
      kycStatus: {
        type: String,
        enum: ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED", "EXPIRED"],
        default: "NOT_SUBMITTED"
      },
      kycSubmittedAt: { type: Date },
      kycApprovedAt: { type: Date },
      kycRejectedAt: { type: Date },
      kycRejectionReason: { type: String },
      kycApprovedBy: { type: Schema.Types.ObjectId, ref: "User" }, // Admin who approved
      
      // KYC documents
      kycDocuments: [{
        documentType: {
          type: String,
          enum: ["NID", "PASSPORT", "DRIVERS_LICENSE", "BUSINESS_LICENSE", "UTILITY_BILL", "BANK_STATEMENT"],
          required: true
        },
        documentNumber: { type: String, required: true },
        documentUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        verifiedAt: { type: Date },
        verificationStatus: {
          type: String,
          enum: ["PENDING", "VERIFIED", "REJECTED"],
          default: "PENDING"
        },
        rejectionReason: { type: String }
      }],
      
      // Provider badges and verification
      badges: [{
        type: { type: String, enum: ["VERIFIED", "PREMIUM", "TOP_RATED", "FAST_RESPONSE", "EXCELLENT_SERVICE"] },
        awardedAt: { type: Date, default: Date.now },
        awardedBy: { type: Schema.Types.ObjectId, ref: "User" }, // Admin or system
        expiresAt: { type: Date }, // Some badges may expire
        description: { type: String }
      }],
      
      // Business verification
      businessVerification: {
        isVerified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
        verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
        verificationMethod: { type: String, enum: ["DOCUMENT", "PHONE", "EMAIL", "ADDRESS"] }
      },
      
      // Service areas and availability
      serviceAreas: [{
        area: { type: String, required: true },
        radius: { type: Number, default: 10 }, // in km
        isActive: { type: Boolean, default: true }
      }],
      
      // Availability settings
      availability: {
        isAvailable: { type: Boolean, default: true },
        workingHours: {
          monday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
          tuesday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
          wednesday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
          thursday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
          friday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
          saturday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
          sunday: { start: String, end: String, isWorking: { type: Boolean, default: true } }
        },
        timezone: { type: String, default: "Asia/Kathmandu" }
      }
    },
    
    // Enhanced user profile
    profile: {
      dateOfBirth: { type: Date },
      gender: { type: String, enum: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"] },
      address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String, default: "Nepal" }
      },
      emergencyContact: {
        name: { type: String },
        phone: { type: String },
        relationship: { type: String }
      }
    },
    
    // Security and verification
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    phoneVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    phoneVerificationExpires: { type: Date },
    
    // Account status
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String },
    suspendedAt: { type: Date },
    suspendedBy: { type: Schema.Types.ObjectId, ref: "User" },
    
    // Authentication
    refreshTokenHash: { type: String },
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
    failedLoginAttempts: { type: Number, default: 0 },
    accountLockedUntil: { type: Date },
    
    // Preferences
    preferences: {
      language: { type: String, default: "en" },
      currency: { type: String, default: "NPR" },
      timezone: { type: String, default: "Asia/Kathmandu" },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true }
      }
    }
  },
  { timestamps: true }
);

// Indexes for performance and querying
userSchema.index({ "provider.categories": 1 });
userSchema.index({ role: 1 });
userSchema.index({ "provider.kycStatus": 1 });
userSchema.index({ "provider.isVerified": 1 });
userSchema.index({ "provider.availability.isAvailable": 1 });
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  if (this.isModified('provider.kycStatus')) {
    if (this.provider?.kycStatus === 'APPROVED' && !this.provider.kycApprovedAt) {
      this.provider.kycApprovedAt = new Date();
    } else if (this.provider?.kycStatus === 'REJECTED' && !this.provider.kycRejectedAt) {
      this.provider.kycRejectedAt = new Date();
    }
  }
  next();
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for display name (business name for providers, regular name for users)
userSchema.virtual('displayName').get(function() {
  if (this.role === 'provider' && this.provider?.businessName) {
    return this.provider.businessName;
  }
  return this.name;
});

// Method to check if user can receive bookings
userSchema.methods.canReceiveBookings = function() {
  if (this.role !== 'provider') return false;
  if (!this.isActive || this.isSuspended) return false;
  if (this.provider?.kycStatus !== 'APPROVED') return false;
  if (!this.provider?.isVerified) return false;
  if (!this.provider?.availability?.isAvailable) return false;
  return true;
};

// Method to add badge
userSchema.methods.addBadge = function(badgeType: string, description?: string, expiresAt?: Date) {
  if (!this.provider) return false;
  
  const badge = {
    type: badgeType,
    awardedAt: new Date(),
    description: description || '',
    expiresAt: expiresAt
  };
  
  if (!this.provider.badges) {
    this.provider.badges = [];
  }
  
  this.provider.badges.push(badge);
  return true;
};

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  displayName: string;
  canReceiveBookings(): boolean;
  addBadge(badgeType: string, description?: string, expiresAt?: Date): boolean;
};

export const UserModel = mongoose.model("User", userSchema);


