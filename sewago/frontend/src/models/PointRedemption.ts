import mongoose from 'mongoose';

const pointRedemptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loyaltyPointsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoyaltyPoints',
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  discountAmount: {
    type: Number,
    required: true // in paisa (NPR cents)
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: false
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPLIED', 'EXPIRED', 'CANCELLED'],
    default: 'PENDING'
  },
  redeemedAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

export const PointRedemption = mongoose.models.PointRedemption || mongoose.model('PointRedemption', pointRedemptionSchema);