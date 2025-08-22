import mongoose from 'mongoose';

const challengeParticipationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SeasonalChallenge',
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    required: false
  },
  rewardClaimed: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one participation per challenge per user
challengeParticipationSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

export const ChallengeParticipation = mongoose.models.ChallengeParticipation || mongoose.model('ChallengeParticipation', challengeParticipationSchema);