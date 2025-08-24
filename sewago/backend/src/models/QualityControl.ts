import mongoose, { Schema, InferSchemaType } from "mongoose";

const qualityControlSchema = new Schema(
  {
    // Service guarantees
    serviceGuarantees: [{
      serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
      guaranteeType: {
        type: String,
        enum: ["SATISFACTION", "TIMELINESS", "QUALITY", "PRICE_MATCH", "REWORK"],
        required: true
      },
      description: { type: String, required: true },
      terms: { type: String },
      validityHours: { type: Number, default: 24 },
      compensation: {
        type: { type: String, enum: ["REFUND", "REWORK", "DISCOUNT", "CREDIT"] },
        amount: { type: Number },
        percentage: { type: Number }
      }
    }],
    
    // Quality monitoring
    qualityMetrics: [{
      metricName: { type: String, required: true },
      metricType: {
        type: String,
        enum: ["RESPONSE_TIME", "COMPLETION_RATE", "CUSTOMER_SATISFACTION", "REWORK_RATE", "ON_TIME_DELIVERY"],
        required: true
      },
      target: { type: Number, required: true },
      current: { type: Number, default: 0 },
      unit: { type: String, required: true },
      weight: { type: Number, min: 0, max: 1, default: 1 }
    }],
    
    // Provider quality scores
    providerQualityScores: [{
      providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      overallScore: { type: Number, min: 0, max: 100, default: 0 },
      categoryScores: [{
        category: { type: String, required: true },
        score: { type: Number, min: 0, max: 100 },
        weight: { type: Number, min: 0, max: 1 }
      }],
      lastUpdated: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ["EXCELLENT", "GOOD", "AVERAGE", "BELOW_AVERAGE", "SUSPENDED"],
        default: "AVERAGE"
      }
    }],
    
    // Quality incidents and resolutions
    qualityIncidents: [{
      bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
      incidentType: {
        type: String,
        enum: ["LATE_ARRIVAL", "POOR_QUALITY", "INCOMPLETE_SERVICE", "DAMAGE", "UNPROFESSIONAL_BEHAVIOR"],
        required: true
      },
      severity: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        required: true
      },
      description: { type: String, required: true },
      reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      reportedAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ["REPORTED", "INVESTIGATING", "RESOLVED", "ESCALATED", "CLOSED"],
        default: "REPORTED"
      },
      resolution: {
        action: { type: String },
        compensation: { type: String },
        resolvedAt: { type: Date },
        resolvedBy: { type: Schema.Types.ObjectId, ref: "User" }
      }
    }],
    
    // Quality assurance processes
    qualityAssurance: {
      autoReviewThreshold: { type: Number, default: 4.0 }, // Rating below this triggers review
      manualReviewRequired: { type: Boolean, default: true },
      reviewFrequency: { type: String, enum: ["DAILY", "WEEKLY", "MONTHLY"], default: "WEEKLY" },
      escalationRules: [{
        condition: { type: String, required: true },
        action: { type: String, required: true },
        threshold: { type: Number, required: true }
      }]
    },
    
    // Customer feedback analysis
    feedbackAnalysis: {
      sentimentScores: [{
        period: { type: String, required: true },
        positive: { type: Number, default: 0 },
        neutral: { type: Number, default: 0 },
        negative: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
      }],
      commonIssues: [{
        issue: { type: String, required: true },
        frequency: { type: Number, default: 0 },
        category: { type: String, required: true }
      }],
      improvementSuggestions: [{
        suggestion: { type: String, required: true },
        category: { type: String, required: true },
        priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
        status: { type: String, enum: ["PENDING", "IN_PROGRESS", "IMPLEMENTED", "REJECTED"], default: "PENDING" }
      }]
    }
  },
  { timestamps: true }
);

qualityControlSchema.index({ "providerQualityScores.providerId": 1 });
qualityControlSchema.index({ "qualityIncidents.bookingId": 1 });
qualityControlSchema.index({ "qualityIncidents.status": 1 });
qualityControlSchema.index({ "providerQualityScores.status": 1 });

export type QualityControlDocument = InferSchemaType<typeof qualityControlSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const QualityControlModel = mongoose.model("QualityControl", qualityControlSchema);
