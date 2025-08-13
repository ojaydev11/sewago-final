import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProviderProfile extends Document {
  _id: string;
  userId: Types.ObjectId;
  skills: string[];
  bio?: string;
  ratingAvg: number;
  jobsCompleted: number;
  verified: boolean;
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
  skills: [{
    type: String,
    trim: true,
  }],
  bio: {
    type: String,
    trim: true,
  },
  ratingAvg: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  jobsCompleted: {
    type: Number,
    default: 0,
    min: 0,
  },
  verified: {
    type: Boolean,
    default: false,
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
ProviderProfileSchema.index({ skills: 1 });
ProviderProfileSchema.index({ ratingAvg: 1 });
ProviderProfileSchema.index({ verified: 1 });
ProviderProfileSchema.index({ jobsCompleted: 1 });

// Hot-reload guard
export const ProviderProfile = mongoose.models.ProviderProfile || mongoose.model<IProviderProfile>('ProviderProfile', ProviderProfileSchema);
