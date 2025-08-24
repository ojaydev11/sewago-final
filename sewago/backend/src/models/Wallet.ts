import mongoose, { Schema, InferSchemaType } from "mongoose";

const walletSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "NPR" },
    
    // Enhanced transaction history with idempotency
    transactions: [{
      type: {
        type: String,
        enum: ["CREDIT", "DEBIT", "REFUND", "BONUS", "REFERRAL", "CASHBACK", "TOPUP", "PAYOUT"],
        required: true
      },
      amount: { type: Number, required: true },
      description: { type: String, required: true },
      bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
      referenceId: { type: String, required: true, unique: true }, // For idempotency
      gatewayTransactionId: { type: String }, // eSewa/Khalti transaction ID
      status: { 
        type: String, 
        enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"], 
        default: "PENDING" 
      },
      metadata: { type: Schema.Types.Mixed }, // Store raw gateway response
      timestamp: { type: Date, default: Date.now }
    }],
    
    // Payment methods linked to wallet
    linkedPaymentMethods: [{
      method: { type: String, enum: ["ESEWA", "KHALTI", "BANK", "CARD"] },
      accountId: { type: String },
      isDefault: { type: Boolean, default: false },
      isVerified: { type: Boolean, default: false }
    }],
    
    // Auto-recharge settings
    autoRecharge: {
      enabled: { type: Boolean, default: false },
      threshold: { type: Number, default: 100 },
      amount: { type: Number, default: 500 },
      paymentMethod: { type: String }
    },
    
    // BNPL settings
    bnplEnabled: { type: Boolean, default: false },
    creditLimit: { type: Number, default: 0 },
    usedCredit: { type: Number, default: 0 },
    creditScore: { type: Number, default: 0 },
    
    // Security & Fraud Prevention
    isLocked: { type: Boolean, default: false },
    lastActivity: { type: Date, default: Date.now },
    failedAttempts: { type: Number, default: 0 },
    lockReason: { type: String },
    
    // Audit trail
    auditLog: [{
      action: { type: String, required: true },
      amount: { type: Number },
      previousBalance: { type: Number },
      newBalance: { type: Number },
      performedBy: { type: Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date, default: Date.now },
      ipAddress: { type: String },
      userAgent: { type: String }
    }]
  },
  { timestamps: true }
);

// Indexes for performance and querying
walletSchema.index({ userId: 1 });
walletSchema.index({ "transactions.timestamp": -1 });
walletSchema.index({ "transactions.referenceId": 1 }, { unique: true });
walletSchema.index({ "transactions.gatewayTransactionId": 1 });
walletSchema.index({ "transactions.status": 1 });

// Pre-save middleware to update audit log
walletSchema.pre('save', function(next) {
  if (this.isModified('balance')) {
    const auditEntry = {
      action: 'BALANCE_UPDATE',
      amount: this.balance,
      previousBalance: 0, // We can't access previous balance in pre-save
      newBalance: this.balance,
      timestamp: new Date()
    };
    
          if (!this.auditLog) {
        this.auditLog = [] as any[];
      }
    this.auditLog.push(auditEntry);
  }
  next();
});

export type WalletDocument = InferSchemaType<typeof walletSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const WalletModel = mongoose.model("Wallet", walletSchema);
