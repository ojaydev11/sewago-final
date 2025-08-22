import mongoose from 'mongoose';

const gamificationSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  showBadgeProgress: {
    type: Boolean,
    default: true
  },
  showStreakCounter: {
    type: Boolean,
    default: true
  },
  showPointsBalance: {
    type: Boolean,
    default: true
  },
  challengeReminders: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const GamificationSettings = mongoose.models.GamificationSettings || mongoose.model('GamificationSettings', gamificationSettingsSchema);