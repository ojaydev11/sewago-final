import mongoose, { Schema, InferSchemaType } from "mongoose";

const referralSchema = new Schema(
  {
    referrerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    referredId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    referralCode: { type: String, required: true, unique: true },
    
    // Referral status
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "COMPLETED", "EXPIRED"],
      default: "PENDING"
    },
    
    // Rewards and incentives
    referrerReward: {
      type: { type: String, enum: ["CASHBACK", "WALLET_CREDIT", "DISCOUNT", "POINTS"] },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "NPR" },
      claimed: { type: Boolean, default: false },
      claimedAt: { type: Date }
    },
    
    referredReward: {
      type: { type: String, enum: ["WELCOME_BONUS", "FIRST_BOOKING_DISCOUNT", "WALLET_CREDIT"] },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "NPR" },
      claimed: { type: Boolean, default: false },
      claimedAt: { type: Date }
    },
    
    // Social network features
    socialCircle: {
      circleId: { type: String },
      circleName: { type: String },
      members: [{ type: Schema.Types.ObjectId, ref: "User" }],
      maxMembers: { type: Number, default: 10 }
    },
    
    // Split payment support
    splitPaymentEnabled: { type: Boolean, default: false },
    splitMethod: {
      type: String,
      enum: ["EQUAL", "PERCENTAGE", "CUSTOM"],
      default: "EQUAL"
    },
    
    // Analytics
    conversionDate: { type: Date },
    firstBookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    totalBookings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 }
  },
  { timestamps: true }
);

referralSchema.index({ referrerId: 1 });
referralSchema.index({ referredId: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ status: 1 });

export type ReferralDocument = InferSchemaType<typeof referralSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ReferralModel = mongoose.model("Referral", referralSchema);
