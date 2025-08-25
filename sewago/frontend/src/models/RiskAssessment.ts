
import mongoose, { Schema, Document } from 'mongoose';

export interface IRiskAssessment extends Document {
  bookingId: string;
  userId: string;
  riskScore: number;
  riskFactors: {
    repeatCancellations: number;
    deviceFingerprint: string;
    ipCityMismatch: boolean;
    throwawayEmail: boolean;
    bookingVelocity: number;
    blacklistedPhone: boolean;
    suspiciousPatterns: string[];
  };
  gateActions: {
    otpRequired: boolean;
    expressSlotsSuppressed: boolean;
    manualReviewRequired: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RiskAssessmentSchema: Schema = new Schema({
  bookingId: { 
    type: String, 
    required: true
  },
  userId: { 
    type: String, 
    required: true
  },
  riskScore: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100 
  },
  riskFactors: {
    repeatCancellations: { type: Number, default: 0 },
    deviceFingerprint: { type: String, required: true },
    ipCityMismatch: { type: Boolean, default: false },
    throwawayEmail: { type: Boolean, default: false },
    bookingVelocity: { type: Number, default: 0 },
    blacklistedPhone: { type: Boolean, default: false },
    suspiciousPatterns: [{ type: String }]
  },
  gateActions: {
    otpRequired: { type: Boolean, default: false },
    expressSlotsSuppressed: { type: Boolean, default: false },
    manualReviewRequired: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  collection: 'risk_assessments'
});

// Indexes for performance
RiskAssessmentSchema.index({ bookingId: 1, userId: 1 });
RiskAssessmentSchema.index({ riskScore: -1 });
RiskAssessmentSchema.index({ createdAt: -1 });

export default mongoose.models.RiskAssessment || mongoose.model<IRiskAssessment>('RiskAssessment', RiskAssessmentSchema);
