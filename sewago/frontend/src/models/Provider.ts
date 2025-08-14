import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProvider extends Document {
  _id: string;
  userId: Types.ObjectId;
  services: Types.ObjectId[];
  hourlyRate: number;
  availability: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  documents: Array<{
    type: string;
    url: string;
    verified: boolean;
    uploadedAt: Date;
  }>;
  rating: number;
  totalReviews: number;
  completedJobs: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderSchema = new Schema<IProvider>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  services: [{
    type: Schema.Types.ObjectId,
    ref: 'Service',
  }],
  hourlyRate: {
    type: Number,
    required: true,
    min: 0,
  },
  availability: {
    monday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      available: { type: Boolean, default: true },
    },
    tuesday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      available: { type: Boolean, default: true },
    },
    wednesday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      available: { type: Boolean, default: true },
    },
    thursday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      available: { type: Boolean, default: true },
    },
    friday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      available: { type: Boolean, default: true },
    },
    saturday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      available: { type: Boolean, default: true },
    },
    sunday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      available: { type: Boolean, default: false },
    },
  },
  documents: [{
    type: {
      type: String,
      required: true,
      enum: ['id_proof', 'address_proof', 'certification', 'insurance', 'other'],
    },
    url: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  completedJobs: {
    type: Number,
    default: 0,
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
ProviderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for performance
ProviderSchema.index({ userId: 1 });
ProviderSchema.index({ services: 1 });
ProviderSchema.index({ isActive: 1 });
ProviderSchema.index({ rating: -1 });
ProviderSchema.index({ districts: 1 });

// Hot-reload guard
export const Provider = mongoose.models.Provider || mongoose.model<IProvider>('Provider', ProviderSchema);

