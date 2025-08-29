import { Request, Response } from "express";
import { WalletModel } from "../models/Wallet.js";
import { WalletLedgerModel } from "../models/WalletLedger.js";
import { PayoutRequestModel } from "../models/PayoutRequest.js";
import { UserModel } from "../models/User.js";
import { BookingModel } from "../models/Booking.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// Get user wallet
export const getUserWallet = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let wallet = await WalletModel.findOne({ userId });
    
    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = await WalletModel.create({
        userId,
        balance: 0,
        currency: "NPR"
      });
    }

    res.json({ success: true, wallet });
  } catch (error) {
    console.error("Error getting wallet:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Enhanced wallet top-up with idempotency
export const topUpWallet = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { amount, paymentMethod, gatewayTransactionId, idempotencyKey } = req.body;

    if (!userId || !amount || amount <= 0 || !idempotencyKey) {
      return res.status(400).json({ message: "Invalid request parameters" });
    }

    // Check idempotency - prevent double-spend
    const existingTransaction = await WalletLedgerModel.findOne({
      referenceId: idempotencyKey
    });

    if (existingTransaction) {
      return res.json({
        success: true,
        message: "Top-up already processed",
        transaction: existingTransaction,
        isDuplicate: true
      });
    }

    const wallet = await WalletModel.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Create ledger entry for top-up
    const ledgerEntry = await (WalletLedgerModel as any).createEntry({
      entryId: uuidv4(),
      userId,
      walletId: wallet._id,
      transactionType: "TOPUP",
      amount,
      currency: "NPR",
      debitAccount: "WALLET_CASH",
      creditAccount: `GATEWAY_${paymentMethod.toUpperCase()}`,
      referenceId: idempotencyKey,
      gatewayTransactionId,
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance + amount,
      description: `Wallet top-up via ${paymentMethod}`,
      metadata: req.body,
      createdBy: userId,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent")
    });

    // Update wallet balance
    wallet.balance += amount;
    wallet.lastActivity = new Date();
    
    // Add transaction to wallet
    if (!wallet.transactions) {
      wallet.transactions = [];
    }
    (wallet.transactions as any).push({
      type: "TOPUP",
      amount,
      description: `Wallet top-up via ${paymentMethod}`,
      referenceId: idempotencyKey,
      gatewayTransactionId,
      status: "COMPLETED",
      metadata: req.body,
      timestamp: new Date()
    });

    await wallet.save();

    res.json({
      success: true,
      message: "Top-up successful",
      newBalance: wallet.balance,
      transaction: ledgerEntry
    });
  } catch (error) {
    console.error("Error in wallet top-up:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Enhanced refund functionality
export const refundWallet = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { amount, bookingId, reason, idempotencyKey } = req.body;

    if (!userId || !amount || amount <= 0 || !idempotencyKey) {
      return res.status(400).json({ message: "Invalid request parameters" });
    }

    // Check idempotency
    const existingRefund = await WalletLedgerModel.findOne({
      referenceId: idempotencyKey
    });

    if (existingRefund) {
      return res.json({
        success: true,
        message: "Refund already processed",
        refund: existingRefund,
        isDuplicate: true
      });
    }

    // Verify booking exists and is cancellable
    const booking = await BookingModel.findOne({
      _id: bookingId,
      userId,
      status: { $in: ["PENDING_CONFIRMATION", "CONFIRMED", "PROVIDER_ASSIGNED"] }
    });

    if (!booking) {
      return res.status(400).json({ message: "Booking not found or not eligible for refund" });
    }

    const wallet = await WalletModel.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Create ledger entry for refund
    const ledgerEntry = await (WalletLedgerModel as any).createEntry({
      entryId: uuidv4(),
      userId,
      walletId: wallet._id,
      transactionType: "BOOKING_REFUND",
      amount,
      currency: "NPR",
      debitAccount: "WALLET_CASH",
      creditAccount: "BOOKING_REFUND",
      referenceId: idempotencyKey,
      bookingId,
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance + amount,
      description: `Refund for booking ${bookingId}: ${reason}`,
      metadata: { reason, bookingId },
      createdBy: userId,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent")
    });

    // Update wallet balance
    wallet.balance += amount;
    wallet.lastActivity = new Date();
    
    // Add transaction to wallet
    if (!wallet.transactions) {
      wallet.transactions = [];
    }
    (wallet.transactions as any).push({
      type: "REFUND",
      amount,
      description: `Refund for booking ${bookingId}: ${reason}`,
      referenceId: idempotencyKey,
      bookingId,
      status: "COMPLETED",
      metadata: { reason, bookingId },
      timestamp: new Date()
    });

    await wallet.save();

    res.json({
      success: true,
      message: "Refund processed successfully",
      newBalance: wallet.balance,
      refund: ledgerEntry
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get transaction history with pagination
export const getTransactionHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20, type, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = { userId };

    if (type) filter.transactionType = type;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const transactions = await WalletLedgerModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("bookingId", "address scheduledAt status");

    const total = await WalletLedgerModel.countDocuments(filter);

    res.json({
      success: true,
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Error getting transaction history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Export transactions to CSV
export const exportTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate, format = "csv" } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const filter: any = { userId };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const transactions = await WalletLedgerModel.find(filter)
      .sort({ createdAt: -1 })
      .populate("bookingId", "address scheduledAt status");

    if (format === "csv") {
      const csvData = transactions.map(t => ({
        Date: t.createdAt.toISOString().split('T')[0],
        Type: t.transactionType,
        Amount: t.amount,
        Currency: t.currency,
        Description: t.description,
        Balance: t.balanceAfter,
        Reference: t.referenceId
      }));

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=wallet-transactions.csv");
      
      const csv = csvData.map(row => 
        Object.values(row).map(value => `"${value}"`).join(",")
      ).join("\n");
      
      res.send(csv);
    } else {
      res.json({ success: true, transactions });
    }
  } catch (error) {
    console.error("Error exporting transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Setup BNPL (Buy Now Pay Later)
export const setupBNPL = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { creditLimit, enable } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const wallet = await WalletModel.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (enable) {
      wallet.bnplEnabled = true;
      wallet.creditLimit = creditLimit || 1000; // Default 1000 NPR
      wallet.usedCredit = 0;
    } else {
      wallet.bnplEnabled = false;
      wallet.creditLimit = 0;
      wallet.usedCredit = 0;
    }

    await wallet.save();

    res.json({
      success: true,
      message: `BNPL ${enable ? 'enabled' : 'disabled'} successfully`,
      bnplStatus: {
        enabled: wallet.bnplEnabled,
        creditLimit: wallet.creditLimit,
        usedCredit: wallet.usedCredit,
        availableCredit: wallet.creditLimit - wallet.usedCredit
      }
    });
  } catch (error) {
    console.error("Error setting up BNPL:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Request payout (for providers)
export const requestPayout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { amount, paymentMethod, bankDetails, digitalWalletDetails } = req.body;

    if (!userId || !amount || amount < 100) {
      return res.status(400).json({ message: "Invalid amount (minimum 100 NPR)" });
    }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can request payouts" });
    }

    // Check if provider has sufficient earnings
    const wallet = await WalletModel.findOne({ userId });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance for payout" });
    }

    const payoutRequest = await (PayoutRequestModel as any).createRequest({
      requestId: `PAYOUT_${Date.now()}_${userId}`,
      providerId: userId,
      providerName: user.provider?.businessName || user.name,
      providerPhone: user.phone,
      amount,
      paymentMethod,
      bankDetails,
      digitalWalletDetails,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent")
    });

    res.json({
      success: true,
      message: "Payout request submitted successfully",
      payoutRequest
    });
  } catch (error) {
    console.error("Error requesting payout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get payout history
export const getPayoutHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20, status } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = { providerId: userId };

    if (status) filter.status = status;

    const payouts = await PayoutRequestModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await PayoutRequestModel.countDocuments(filter);

    res.json({
      success: true,
      payouts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Error getting payout history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Legacy methods for backward compatibility
export const addFunds = topUpWallet;
export const useWallet = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { amount, bookingId, description } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid request parameters" });
    }

    const wallet = await WalletModel.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    // Deduct from wallet
    wallet.balance -= amount;
    wallet.lastActivity = new Date();

    if (!wallet.transactions) {
      wallet.transactions = [];
    }
    (wallet.transactions as any).push({
      type: "DEBIT",
      amount: -amount,
      description: description || "Wallet payment",
      referenceId: bookingId,
      status: "COMPLETED",
      timestamp: new Date()
    });

    await wallet.save();

    res.json({
      success: true,
      message: "Wallet payment successful",
      newBalance: wallet.balance
    });
  } catch (error) {
    console.error("Error using wallet:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const setupAutoRecharge = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { enabled, threshold, rechargeAmount, paymentMethod } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const wallet = await WalletModel.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    wallet.autoRecharge = {
      enabled: enabled || false,
      threshold: threshold || 100,
      amount: rechargeAmount || 500,
      paymentMethod: paymentMethod || "CARD"
    };

    await wallet.save();

    res.json({
      success: true,
      message: "Auto-recharge settings updated",
      autoRecharge: wallet.autoRecharge
    });
  } catch (error) {
    console.error("Error setting up auto-recharge:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
