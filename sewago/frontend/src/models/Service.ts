import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  _id: string;
  slug: string;
  name: string;
  category: string;
  shortDesc: string;
  longDesc: string;
  basePrice: number;
  image?: string;
  active: boolean;
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
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  shortDesc: {
    type: String,
    required: true,
    trim: true,
  },
  longDesc: {
    type: String,
    required: true,
    trim: true,
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    trim: true,
  },
  active: {
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
ServiceSchema.index({ active: 1 });
ServiceSchema.index({ basePrice: 1 });
ServiceSchema.index({ createdAt: 1 });

// Hot-reload guard
export const Service = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);