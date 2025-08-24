import mongoose, { Schema, InferSchemaType } from "mongoose";

const walletLedgerSchema = new Schema(
  {
    // Unique identifier for the ledger entry
    entryId: { type: String, required: true, unique: true },
    
    // User and wallet reference
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
    
    // Transaction details
    transactionType: {
      type: String,
      enum: ["TOPUP", "REFUND", "BOOKING_PAYMENT", "BOOKING_REFUND", "ADMIN_ADJUSTMENT", "SYSTEM_FEE"],
      required: true
    },
    
    // Amount and currency
    amount: { type: Number, required: true },
    currency: { type: String, default: "NPR" },
    
    // Double-entry bookkeeping
    debitAccount: { type: String, required: true }, // e.g., "WALLET_CASH", "GATEWAY_ESEWA"
    creditAccount: { type: String, required: true }, // e.g., "WALLET_CASH", "GATEWAY_ESEWA"
    
    // Reference information
    referenceId: { type: String, required: true }, // For idempotency
    gatewayTransactionId: { type: String }, // eSewa/Khalti transaction ID
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    
    // Status tracking
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED", "RECONCILED"],
      default: "PENDING"
    },
    
    // Balance before and after
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    
    // Metadata and audit
    metadata: { type: Schema.Types.Mixed }, // Store raw gateway response
    description: { type: String, required: true },
    
    // Reconciliation fields
    reconciledAt: { type: Date },
    reconciliationNotes: { type: String },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    
    // Audit trail
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    ipAddress: { type: String },
    userAgent: { type: String }
  },
  { timestamps: true }
);

// Indexes for performance and reconciliation
walletLedgerSchema.index({ userId: 1, createdAt: -1 });
walletLedgerSchema.index({ referenceId: 1 }, { unique: true });
walletLedgerSchema.index({ gatewayTransactionId: 1 });
walletLedgerSchema.index({ status: 1 });
walletLedgerSchema.index({ transactionType: 1 });
walletLedgerSchema.index({ createdAt: 1 });
walletLedgerSchema.index({ "debitAccount": 1, "creditAccount": 1 });

// Pre-save middleware to update timestamps
walletLedgerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to create ledger entry
walletLedgerSchema.statics.createEntry = async function(entryData: any) {
  const entry = new this(entryData);
  return await entry.save();
};

// Static method to get balance for reconciliation
walletLedgerSchema.statics.getBalanceAt = async function(userId: string, timestamp: Date) {
  const entries = await this.find({
    userId,
    createdAt: { $lte: timestamp },
    status: { $in: ["COMPLETED", "RECONCILED"] }
  }).sort({ createdAt: 1 });
  
  let balance = 0;
  for (const entry of entries) {
    if (entry.debitAccount === "WALLET_CASH") {
      balance += entry.amount;
    } else if (entry.creditAccount === "WALLET_CASH") {
      balance -= entry.amount;
    }
  }
  
  return balance;
};

export type WalletLedgerDocument = InferSchemaType<typeof walletLedgerSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const WalletLedgerModel = mongoose.model("WalletLedger", walletLedgerSchema);
