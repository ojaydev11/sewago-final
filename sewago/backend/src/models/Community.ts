import mongoose, { Schema, InferSchemaType } from "mongoose";

const communitySchema = new Schema(
  {
    // User stories and testimonials
    userStories: [{
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      title: { type: String, required: true },
      content: { type: String, required: true },
      images: [{ type: String }],
      rating: { type: Number, min: 1, max: 5 },
      serviceCategory: { type: String },
      location: { type: String },
      likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
      comments: [{
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        content: { type: String },
        timestamp: { type: Date, default: Date.now }
      }],
      isVerified: { type: Boolean, default: false },
      isFeatured: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ["DRAFT", "PUBLISHED", "ARCHIVED", "MODERATED"],
        default: "DRAFT"
      }
    }],
    
    // Provider spotlights
    providerSpotlights: [{
      providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      achievements: [{ type: String }],
      specializations: [{ type: String }],
      images: [{ type: String }],
      videoUrl: { type: String },
      stats: {
        totalBookings: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        responseTime: { type: Number, default: 0 }, // in minutes
        completionRate: { type: Number, default: 0 } // percentage
      },
      isActive: { type: Boolean, default: true },
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date }
    }],
    
    // Social proof elements
    socialProof: {
      totalUsers: { type: Number, default: 0 },
      totalBookings: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      activeProviders: { type: Number, default: 0 },
      citiesCovered: { type: Number, default: 0 }
    },
    
    // Community events and challenges
    events: [{
      title: { type: String, required: true },
      description: { type: String, required: true },
      type: {
        type: String,
        enum: ["CHALLENGE", "WORKSHOP", "MEETUP", "COMPETITION"],
        required: true
      },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
      maxParticipants: { type: Number },
      rewards: [{ type: String }],
      status: {
        type: String,
        enum: ["UPCOMING", "ACTIVE", "COMPLETED", "CANCELED"],
        default: "UPCOMING"
      }
    }],
    
    // Gamification elements
    gamification: {
      leaderboards: [{
        category: { type: String, required: true },
        period: { type: String, enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"] },
        rankings: [{
          userId: { type: Schema.Types.ObjectId, ref: "User" },
          rank: { type: Number },
          score: { type: Number },
          achievements: [{ type: String }]
        }]
      }],
      badges: [{
        name: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String },
        criteria: { type: String },
        rarity: {
          type: String,
          enum: ["COMMON", "RARE", "EPIC", "LEGENDARY"],
          default: "COMMON"
        }
      }]
    }
  },
  { timestamps: true }
);

communitySchema.index({ "userStories.userId": 1 });
communitySchema.index({ "providerSpotlights.providerId": 1 });
communitySchema.index({ "userStories.status": 1 });
communitySchema.index({ "providerSpotlights.isActive": 1 });

export type CommunityDocument = InferSchemaType<typeof communitySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CommunityModel = mongoose.model("Community", communitySchema);
