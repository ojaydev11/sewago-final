import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  role: 'customer' | 'provider' | 'admin';
  name: string;
  email: string;
  hash: string;
  phone?: string;
  district?: string;
  avatar?: string;
  // Provider-specific fields
  skills?: string[];
  districts?: string[];
  bio?: string;
  isVerified?: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  // Customer-specific fields
  addresses?: Array<{
    label: string;
    address: string;
    isDefault: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['customer', 'provider', 'admin'],
    default: 'customer',
  },
  hash: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  district: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
    trim: true,
  },
  // Provider-specific fields
  skills: [{
    type: String,
    trim: true,
  }],
  districts: [{
    type: String,
    trim: true,
  }],
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  // Customer-specific fields
  addresses: [{
    label: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
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
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ verificationStatus: 1 });
UserSchema.index({ districts: 1 });
UserSchema.index({ skills: 1 });

// Hot-reload guard
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
