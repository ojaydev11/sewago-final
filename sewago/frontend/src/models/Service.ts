import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  title: string;
  slug: string;
  description: string;
  category: string;
  imageUrl?: string;
  priceRange: {
    min: number;
    max: number;
  };
  isActive: boolean;
  hasWarranty: boolean;
  warrantyDays?: number;
  isVerified: boolean;
  reviewStats?: {
    averageRating: number;
    totalReviews: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  priceRange: {
    min: {
      type: Number,
      required: true,
      min: 0,
    },
    max: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  hasWarranty: {
    type: Boolean,
    default: false,
  },
  warrantyDays: {
    type: Number,
    min: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  reviewStats: {
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
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
ServiceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for performance
ServiceSchema.index({ slug: 1 });
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ isActive: 1 });
ServiceSchema.index({ 'priceRange.min': 1, 'priceRange.max': 1 });
ServiceSchema.index({ hasWarranty: 1 });
ServiceSchema.index({ isVerified: 1 });
ServiceSchema.index({ 'reviewStats.averageRating': 1 });
ServiceSchema.index({ 'reviewStats.totalReviews': 1 });

// Hot-reload guard
export const Service = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);