import mongoose from 'mongoose';

const seasonalChallengeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  nameNe: {
    type: String,
    required: true // Nepali name
  },
  description: {
    type: String,
    required: true
  },
  descriptionNe: {
    type: String,
    required: true // Nepali description
  },
  type: {
    type: String,
    enum: [
      'DASHAIN_CLEANING',
      'NEW_YEAR_ORGANIZE',
      'SUMMER_MAINTENANCE',
      'MONSOON_PREP',
      'TIHAR_DECORATION',
      'GENERAL_SEASONAL'
    ],
    required: true
  },
  festival: {
    type: String,
    required: false // Associated festival
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  target: {
    type: Number,
    required: true // Target to complete
  },
  reward: {
    type: Number,
    required: true // Points reward
  },
  badgeReward: {
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
    required: false // Optional badge reward
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const SeasonalChallenge = mongoose.models.SeasonalChallenge || mongoose.model('SeasonalChallenge', seasonalChallengeSchema);