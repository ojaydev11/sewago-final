import mongoose from 'mongoose';

const loyaltyPointsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  availablePoints: {
    type: Number,
    default: 0
  },
  lifetimeEarned: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export const LoyaltyPoints = mongoose.models.LoyaltyPoints || mongoose.model('LoyaltyPoints', loyaltyPointsSchema);