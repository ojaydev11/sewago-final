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

// Hot-reload guard
export const Service = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
