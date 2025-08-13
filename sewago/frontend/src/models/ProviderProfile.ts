import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProviderProfile extends Document {
  userId: Types.ObjectId;
  bio?: string;
  specialties: string[];
  experience: number; // years of experience
  rating: number;
  totalJobs: number;
  isVerified: boolean;
  phone?: string;
  city: string;
  state: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderProfileSchema = new Schema<IProviderProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  specialties: [{
    type: String,
    trim: true,
  }],
  experience: {
    type: Number,
    default: 0,
    min: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalJobs: {
    type: Number,
    default: 0,
    min: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
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
ProviderProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for performance
ProviderProfileSchema.index({ userId: 1 });
ProviderProfileSchema.index({ specialties: 1 });
ProviderProfileSchema.index({ city: 1 });
ProviderProfileSchema.index({ rating: 1 });
ProviderProfileSchema.index({ isVerified: 1 });
ProviderProfileSchema.index({ experience: 1 });

// Hot-reload guard
export const ProviderProfile = mongoose.models.ProviderProfile || mongoose.model<IProviderProfile>('ProviderProfile', ProviderProfileSchema);
