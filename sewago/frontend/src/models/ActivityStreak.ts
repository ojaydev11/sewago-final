import mongoose from 'mongoose';

const activityStreakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['WEEKLY_BOOKING', 'MONTHLY_ACTIVITY', 'REVIEW_STREAK'],
    required: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityAt: {
    type: Date,
    required: false
  },
  streakStartedAt: {
    type: Date,
    required: false
  },
  bonusMultiplier: {
    type: Number,
    default: 1.0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one streak per type per user
activityStreakSchema.index({ userId: 1, type: 1 }, { unique: true });

export const ActivityStreak = mongoose.models.ActivityStreak || mongoose.model('ActivityStreak', activityStreakSchema);