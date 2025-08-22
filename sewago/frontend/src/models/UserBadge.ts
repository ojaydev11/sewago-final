import mongoose from 'mongoose';

const userBadgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badgeType: {
    type: String,
    enum: [
      'REGULAR_CUSTOMER',
      'TOP_REVIEWER',
      'EARLY_ADOPTER',
      'SERVICE_EXPERT',
      'LOYAL_MEMBER',
      'STREAK_MASTER',
      'CHALLENGE_CHAMPION',
      'REFERRAL_HERO'
    ],
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0 // Current progress toward badge
  },
  target: {
    type: Number,
    default: 1 // Target to unlock badge
  },
  isUnlocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure one badge per type per user
userBadgeSchema.index({ userId: 1, badgeType: 1 }, { unique: true });

export const UserBadge = mongoose.models.UserBadge || mongoose.model('UserBadge', userBadgeSchema);