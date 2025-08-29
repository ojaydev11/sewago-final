import mongoose, { Schema, InferSchemaType } from "mongoose";

const reviewSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
<<<<<<< HEAD
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
=======
    
    // Enhanced rating and feedback
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 1000 },
    
    // Photo support (max 5 photos per review)
    photos: [{
      photoUrl: { type: String, required: true },
      photoId: { type: String, required: true, unique: true },
      uploadedAt: { type: Date, default: Date.now },
      isVerified: { type: Boolean, default: false },
      moderationStatus: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED", "FLAGGED"],
        default: "PENDING"
      },
      moderationNotes: { type: String },
      exifData: { type: Schema.Types.Mixed } // Store EXIF data for verification
    }],
    
    // Verification and moderation
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" }, // Admin who verified
    
    // Moderation status
    moderationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "FLAGGED", "UNDER_REVIEW"],
      default: "PENDING"
    },
    moderatedAt: { type: Date },
    moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    moderationNotes: { type: String },
    
    // Anti-spam and fraud prevention
    spamScore: { type: Number, default: 0, min: 0, max: 100 },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String },
    flaggedAt: { type: Date },
    flaggedBy: { type: Schema.Types.ObjectId, ref: "User" },
    
    // Review metadata
    reviewSource: {
      type: String,
      enum: ["POST_COMPLETION", "EMAIL_PROMPT", "IN_APP", "ADMIN_CREATED"],
      default: "POST_COMPLETION"
    },
    language: { type: String, default: "en" },
    sentiment: {
      type: String,
      enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"],
      default: "NEUTRAL"
    },
    
    // Engagement metrics
    helpfulCount: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    isReported: { type: Boolean, default: false },
    
    // Audit trail
    auditLog: [{
      action: { type: String, required: true },
      performedBy: { type: Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date, default: Date.now },
      details: { type: String },
      ipAddress: { type: String }
    }],
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
  },
  { timestamps: true }
);

<<<<<<< HEAD
reviewSchema.index({ providerId: 1 });

export type ReviewDocument = InferSchemaType<typeof reviewSchema> & {
  _id: mongoose.Types.ObjectId;
=======
// Indexes for performance and moderation
reviewSchema.index({ providerId: 1 });
reviewSchema.index({ bookingId: 1 }, { unique: true });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ "moderationStatus": 1 });
reviewSchema.index({ "isVerified": 1 });
reviewSchema.index({ "isFlagged": 1 });
reviewSchema.index({ "spamScore": 1 });
reviewSchema.index({ "createdAt": 1 });
reviewSchema.index({ "rating": 1 });

// Pre-save middleware to handle verification and moderation
reviewSchema.pre('save', function(next) {
  // Update timestamps
  this.updatedAt = new Date();
  
  // Auto-calculate sentiment based on rating
  if (this.rating >= 4) {
    this.sentiment = "POSITIVE";
  } else if (this.rating <= 2) {
    this.sentiment = "NEGATIVE";
  } else {
    this.sentiment = "NEUTRAL";
  }
  
  // Auto-verify if moderation is approved and no photos
  if (this.moderationStatus === "APPROVED" && (!this.photos || this.photos.length === 0)) {
    this.isVerified = true;
    this.verifiedAt = new Date();
  }
  
  next();
});

// Method to add photo
reviewSchema.methods.addPhoto = function(photoUrl: string, photoId: string, exifData?: any) {
  if (this.photos.length >= 5) {
    throw new Error("Maximum 5 photos allowed per review");
  }
  
  const photo = {
    photoUrl,
    photoId,
    uploadedAt: new Date(),
    isVerified: false,
    moderationStatus: "PENDING",
    exifData
  };
  
  this.photos.push(photo);
  return photo;
};

// Method to remove photo
reviewSchema.methods.removePhoto = function(photoId: string) {
  const photoIndex = this.photos.findIndex((photo: any) => photo.photoId === photoId);
  if (photoIndex === -1) {
    throw new Error("Photo not found");
  }
  
  this.photos.splice(photoIndex, 1);
  return true;
};

// Method to flag review
reviewSchema.methods.flagReview = function(reason: string, flaggedBy: string) {
  this.isFlagged = true;
  this.flagReason = reason;
  this.flaggedAt = new Date();
  this.flaggedBy = flaggedBy;
  this.moderationStatus = "FLAGGED";
  
  // Add to audit log
  this.auditLog.push({
    action: "REVIEW_FLAGGED",
    performedBy: flaggedBy,
    timestamp: new Date(),
    details: `Review flagged: ${reason}`,
    ipAddress: ""
  });
  
  return true;
};

// Method to approve review
reviewSchema.methods.approveReview = function(approvedBy: string) {
  this.moderationStatus = "APPROVED";
  this.moderatedAt = new Date();
  this.moderatedBy = approvedBy;
  
  // Auto-verify if no photos or all photos are verified
  const allPhotosVerified = this.photos.length === 0 || 
    this.photos.every((photo: any) => photo.moderationStatus === "APPROVED");
  
  if (allPhotosVerified) {
    this.isVerified = true;
    this.verifiedAt = new Date();
    this.verifiedBy = approvedBy;
  }
  
  // Add to audit log
  this.auditLog.push({
    action: "REVIEW_APPROVED",
    performedBy: approvedBy,
    timestamp: new Date(),
    details: "Review approved by moderator",
    ipAddress: ""
  });
  
  return true;
};

// Method to reject review
reviewSchema.methods.rejectReview = function(reason: string, rejectedBy: string) {
  this.moderationStatus = "REJECTED";
  this.moderatedAt = new Date();
  this.moderatedBy = rejectedBy;
  this.moderationNotes = reason;
  
  // Add to audit log
  this.auditLog.push({
    action: "REVIEW_REJECTED",
    performedBy: rejectedBy,
    timestamp: new Date(),
    details: `Review rejected: ${reason}`,
    ipAddress: ""
  });
  
  return true;
};

// Static method to get verified reviews only
reviewSchema.statics.getVerifiedReviews = function(providerId: string) {
  return this.find({
    providerId,
    isVerified: true,
    moderationStatus: "APPROVED",
    isFlagged: false
  }).sort({ createdAt: -1 });
};

// Static method to get reviews pending moderation
reviewSchema.statics.getPendingModeration = function() {
  return this.find({
    moderationStatus: "PENDING"
  }).sort({ createdAt: 1 });
};

export type ReviewDocument = InferSchemaType<typeof reviewSchema> & {
  _id: mongoose.Types.ObjectId;
  addPhoto(photoUrl: string, photoId: string, exifData?: any): any;
  removePhoto(photoId: string): boolean;
  flagReview(reason: string, flaggedBy: string): boolean;
  approveReview(approvedBy: string): boolean;
  rejectReview(reason: string, rejectedBy: string): boolean;
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
};

export const ReviewModel = mongoose.model("Review", reviewSchema);


