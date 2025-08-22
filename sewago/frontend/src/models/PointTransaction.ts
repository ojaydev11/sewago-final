import mongoose from 'mongoose';

const pointTransactionSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['EARNED', 'REDEEMED', 'EXPIRED'],
    required: true
  },
  source: {
    type: String,
    required: true // "booking", "review", "referral", "challenge"
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // booking id, review id, etc.
  },
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export const PointTransaction = mongoose.models.PointTransaction || mongoose.model('PointTransaction', pointTransactionSchema);