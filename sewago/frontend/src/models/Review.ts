import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  userId: Types.ObjectId;
  serviceId: Types.ObjectId;
  bookingId: Types.ObjectId;
  rating: number; // 1-5 stars
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true, // One review per booking
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
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
ReviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for performance
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ serviceId: 1 });
ReviewSchema.index({ bookingId: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ createdAt: 1 });

// Hot-reload guard
export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
export interface Review {
  _id: string;
  serviceId: string;
  userId: string;
  bookingId: string;
  
  // Review content
  rating: number; // 1-5
  title: string;
  comment: string;
  
  // Customer info
  customerName: string;
  isVerified: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ServiceReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
