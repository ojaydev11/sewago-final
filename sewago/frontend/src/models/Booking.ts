import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  userId: Types.ObjectId;
  serviceId: Types.ObjectId;
  providerId?: Types.ObjectId;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledAt: Date;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
  priceEstimateMin: number;
  priceEstimateMax: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
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
  providerId: {
    type: Schema.Types.ObjectId,
    ref: 'ProviderProfile',
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
  address: {
    street: {
      type: String,
      required: true,
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
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      default: 'Nepal',
      trim: true,
    },
  },
  notes: {
    type: String,
    trim: true,
  },
  priceEstimateMin: {
    type: Number,
    required: true,
    min: 0,
  },
  priceEstimateMax: {
    type: Number,
    required: true,
    min: 0,
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
BookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for performance
BookingSchema.index({ userId: 1 });
BookingSchema.index({ serviceId: 1 });
BookingSchema.index({ providerId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ scheduledAt: 1 });
BookingSchema.index({ createdAt: 1 });

// Hot-reload guard
export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
