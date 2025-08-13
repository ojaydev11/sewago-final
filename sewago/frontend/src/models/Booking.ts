import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  _id: string;
  customerId: Types.ObjectId;
  providerId?: Types.ObjectId;
  serviceId: Types.ObjectId;
  date: Date;
  timeSlot: string;
  address: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  providerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
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
BookingSchema.index({ customerId: 1 });
BookingSchema.index({ serviceId: 1 });
BookingSchema.index({ providerId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ date: 1 });
BookingSchema.index({ createdAt: 1 });

// Hot-reload guard
export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
