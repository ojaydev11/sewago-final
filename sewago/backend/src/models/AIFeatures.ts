import mongoose, { Schema, InferSchemaType } from "mongoose";

const aiFeaturesSchema = new Schema(
  {
    // Predictive search and recommendations
    searchPredictions: [{
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      query: { type: String, required: true },
      predictedServices: [{
        serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
        confidence: { type: Number, min: 0, max: 1 },
        reason: { type: String }
      }],
      searchContext: {
        location: { type: String },
        timeOfDay: { type: String },
        previousSearches: [{ type: String }],
        userPreferences: [{ type: String }]
      },
      timestamp: { type: Date, default: Date.now }
    }],
    
    // Voice booking support
    voiceBookings: [{
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      audioFile: { type: String },
      transcription: { type: String, required: true },
      intent: {
        type: String,
        enum: ["BOOK_SERVICE", "MODIFY_BOOKING", "CANCEL_BOOKING", "GET_INFO", "OTHER"],
        required: true
      },
      confidence: { type: Number, min: 0, max: 1 },
      extractedData: {
        serviceType: { type: String },
        location: { type: String },
        date: { type: String },
        time: { type: String },
        urgency: { type: String }
      },
      status: {
        type: String,
        enum: ["PROCESSING", "CONFIRMED", "NEEDS_CLARIFICATION", "FAILED"],
        default: "PROCESSING"
      },
      processedAt: { type: Date }
    }],
    
    // Smart scheduling recommendations
    schedulingRecommendations: [{
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
      recommendations: [{
        date: { type: Date, required: true },
        timeSlots: [{
          start: { type: String, required: true },
          end: { type: String, required: true },
          score: { type: Number, min: 0, max: 1 },
          factors: [{
            factor: { type: String, required: true },
            impact: { type: String, enum: ["POSITIVE", "NEGATIVE", "NEUTRAL"] },
            weight: { type: Number, min: 0, max: 1 }
          }]
        }]
      }],
      factors: {
        weather: { type: String },
        traffic: { type: String },
        providerAvailability: { type: String },
        userPreferences: { type: String },
        historicalData: { type: String }
      },
      generatedAt: { type: Date, default: Date.now }
    }],
    
    // Dynamic pricing suggestions
    pricingSuggestions: [{
      serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
      basePrice: { type: Number, required: true },
      suggestedPrice: { type: Number, required: true },
      factors: [{
        factor: { type: String, required: true },
        impact: { type: Number, required: true }, // percentage change
        reason: { type: String }
      }],
      marketConditions: {
        demand: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
        competition: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
        seasonality: { type: String }
      },
      validityPeriod: {
        start: { type: Date, required: true },
        end: { type: Date, required: true }
      }
    }],
    
    // User behavior analysis
    userBehavior: [{
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      patterns: {
        preferredTimes: [{ type: String }],
        preferredServices: [{ type: Schema.Types.ObjectId, ref: "Service" }],
        preferredLocations: [{ type: String }],
        bookingFrequency: { type: String, enum: ["DAILY", "WEEKLY", "MONTHLY", "OCCASIONAL"] },
        averageSpend: { type: Number }
      },
      preferences: {
        urgency: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
        quality: { type: String, enum: ["BUDGET", "STANDARD", "PREMIUM"] },
        providerRating: { type: Number, min: 1, max: 5 }
      },
      lastUpdated: { type: Date, default: Date.now }
    }],
    
    // AI model performance tracking
    modelPerformance: [{
      modelName: { type: String, required: true },
      version: { type: String, required: true },
      metrics: {
        accuracy: { type: Number, min: 0, max: 1 },
        precision: { type: Number, min: 0, max: 1 },
        recall: { type: Number, min: 0, max: 1 },
        f1Score: { type: Number, min: 0, max: 1 }
      },
      trainingData: {
        samples: { type: Number },
        lastTrained: { type: Date }
      },
      deployment: {
        status: { type: String, enum: ["ACTIVE", "TESTING", "DEPRECATED"] },
        deployedAt: { type: Date },
        performance: { type: String, enum: ["EXCELLENT", "GOOD", "AVERAGE", "POOR"] }
      }
    }]
  },
  { timestamps: true }
);

aiFeaturesSchema.index({ "searchPredictions.userId": 1 });
aiFeaturesSchema.index({ "voiceBookings.userId": 1 });
aiFeaturesSchema.index({ "schedulingRecommendations.userId": 1 });
aiFeaturesSchema.index({ "pricingSuggestions.serviceId": 1 });
aiFeaturesSchema.index({ "userBehavior.userId": 1 });

export type AIFeaturesDocument = InferSchemaType<typeof aiFeaturesSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AIFeaturesModel = mongoose.model("AIFeatures", aiFeaturesSchema);
