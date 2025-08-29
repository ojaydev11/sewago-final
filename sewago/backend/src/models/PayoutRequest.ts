import mongoose, { Schema, InferSchemaType } from "mongoose";

const payoutRequestSchema = new Schema(
  {
    // Request identification
    requestId: { type: String, required: true, unique: true },
    
    // Provider information
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    providerName: { type: String, required: true },
    providerPhone: { type: String, required: true },
    
    // Payout details
    amount: { type: Number, required: true, min: 100 }, // Minimum 100 NPR
    currency: { type: String, default: "NPR" },
    fee: { type: Number, default: 0 }, // Processing fee
    
    // Payment method
    paymentMethod: {
      type: String,
      enum: ["BANK_TRANSFER", "ESEWA", "KHALTI", "CASH"],
      required: true
    },
    
    // Bank details (if applicable)
    bankDetails: {
      bankName: { type: String },
      accountNumber: { type: String },
      accountHolderName: { type: String },
      branchCode: { type: String }
    },
    
    // Digital wallet details
    digitalWalletDetails: {
      walletType: { type: String, enum: ["ESEWA", "KHALTI"] },
      walletId: { type: String }
    },
    
    // Status tracking
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"],
      default: "PENDING"
    },
    
    // Processing information
    processedAt: { type: Date },
    processedBy: { type: Schema.Types.ObjectId, ref: "User" }, // Admin who processed
    gatewayTransactionId: { type: String }, // External payment gateway reference
    
    // Rejection information
    rejectedAt: { type: Date },
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String },
    
    // Audit trail
    notes: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes for performance and querying
payoutRequestSchema.index({ providerId: 1, createdAt: -1 });
payoutRequestSchema.index({ status: 1 });
payoutRequestSchema.index({ requestId: 1 }, { unique: true });
payoutRequestSchema.index({ createdAt: 1 });
payoutRequestSchema.index({ "paymentMethod": 1, "status": 1 });

// Pre-save middleware to update timestamps
payoutRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for net amount (amount - fee)
payoutRequestSchema.virtual('netAmount').get(function() {
  return this.amount - this.fee;
});

// Static method to create payout request
payoutRequestSchema.statics.createRequest = async function(requestData: any) {
  const request = new this(requestData);
  return await request.save();
};

// Static method to get pending payouts for a provider
payoutRequestSchema.statics.getPendingPayouts = async function(providerId: string) {
  return await this.find({
    providerId,
    status: { $in: ["PENDING", "APPROVED", "PROCESSING"] }
  }).sort({ createdAt: 1 });
};

// Static method to get total pending amount for a provider
payoutRequestSchema.statics.getTotalPendingAmount = async function(providerId: string) {
  const result = await this.aggregate([
    {
      $match: {
        providerId: new mongoose.Types.ObjectId(providerId),
        status: { $in: ["PENDING", "APPROVED", "PROCESSING"] }
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        totalFee: { $sum: "$fee" },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return result[0] || { totalAmount: 0, totalFee: 0, count: 0 };
};

export type PayoutRequestDocument = InferSchemaType<typeof payoutRequestSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PayoutRequestModel = mongoose.model("PayoutRequest", payoutRequestSchema);
