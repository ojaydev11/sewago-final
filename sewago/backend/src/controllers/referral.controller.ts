import { Request, Response } from "express";
import { ReferralModel } from "../models/Referral.js";
import { UserModel } from "../models/User.js";
import { WalletModel } from "../models/Wallet.js";
import { v4 as uuidv4 } from "uuid";

// Generate referral code
export const generateReferralCode = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const referralCode = `SEWAGO${uuidv4().substring(0, 8).toUpperCase()}`;
    
    // Check if user already has a referral code
    let existingReferral = await ReferralModel.findOne({ referrerId: userId });
    
    if (existingReferral) {
      return res.json({ 
        success: true, 
        referralCode: existingReferral.referralCode,
        message: "Referral code already exists" 
      });
    }

    // Create new referral record
    const referral = await ReferralModel.create({
      referrerId: userId,
      referralCode,
      status: "PENDING"
    });

    res.json({ 
      success: true, 
      referralCode: referral.referralCode,
      message: "Referral code generated successfully" 
    });
  } catch (error) {
    console.error("Error generating referral code:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Use referral code
export const useReferralCode = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { referralCode } = req.body;

    if (!userId || !referralCode) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Find referral
    const referral = await ReferralModel.findOne({ referralCode });
    if (!referral) {
      return res.status(400).json({ message: "Invalid referral code" });
    }

    if (referral.referredId) {
      return res.status(400).json({ message: "Referral code already used" });
    }

    if (referral.referrerId.toString() === userId) {
      return res.status(400).json({ message: "Cannot use your own referral code" });
    }

    // Update referral
    referral.referredId = userId;
    referral.status = "ACTIVE";
    referral.conversionDate = new Date();
    await referral.save();

    // Give rewards to both users
    const referrerWallet = await WalletModel.findOne({ userId: referral.referrerId });
    const referredWallet = await WalletModel.findOne({ userId });

    if (referrerWallet) {
      referrerWallet.transactions.push({
        type: "REFERRAL",
        amount: 100, // Referrer bonus
        description: "Referral bonus",
        referenceId: referral._id.toString(),
        timestamp: new Date()
      });
      referrerWallet.balance += 100;
      await referrerWallet.save();
    }

    if (referredWallet) {
      referredWallet.transactions.push({
        type: "REFERRAL",
        amount: 50, // Referred user bonus
        description: "Welcome bonus for using referral code",
        referenceId: referral._id.toString(),
        timestamp: new Date()
      });
      referredWallet.balance += 50;
      await referredWallet.save();
    }

    res.json({ 
      success: true, 
      message: "Referral code applied successfully",
      referrerId: referral.referrerId,
      rewards: {
        referrer: 100,
        referred: 50
      }
    });
  } catch (error) {
    console.error("Error using referral code:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get referral statistics
export const getReferralStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const referrals = await ReferralModel.find({ referrerId: userId });
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.status === "ACTIVE").length;
    const completedReferrals = referrals.filter(r => r.status === "COMPLETED").length;

    // Calculate total earnings from referrals
    const totalEarnings = referrals.reduce((sum, ref) => {
      if (ref.referrerReward?.claimed) {
        return sum + (ref.referrerReward.amount || 0);
      }
      return sum;
    }, 0);

    res.json({
      success: true,
      stats: {
        totalReferrals,
        activeReferrals,
        completedReferrals,
        totalEarnings,
        referralCode: referrals[0]?.referralCode || null
      }
    });
  } catch (error) {
    console.error("Error getting referral stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create social circle
export const createSocialCircle = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { circleName, maxMembers = 10 } = req.body;

    if (!userId || !circleName) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const circleId = `CIRCLE${uuidv4().substring(0, 8).toUpperCase()}`;
    
    const referral = await ReferralModel.findOne({ referrerId: userId });
    if (!referral) {
      return res.status(400).json({ message: "Referral not found" });
    }

    referral.socialCircle = {
      circleId,
      circleName,
      members: [userId],
      maxMembers
    };

    await referral.save();

    res.json({
      success: true,
      message: "Social circle created successfully",
      circle: referral.socialCircle
    });
  } catch (error) {
    console.error("Error creating social circle:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Join social circle
export const joinSocialCircle = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { circleId } = req.body;

    if (!userId || !circleId) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const referral = await ReferralModel.findOne({ "socialCircle.circleId": circleId });
    if (!referral) {
      return res.status(400).json({ message: "Social circle not found" });
    }

    if (referral.socialCircle.members.includes(userId)) {
      return res.status(400).json({ message: "Already a member of this circle" });
    }

    if (referral.socialCircle.members.length >= referral.socialCircle.maxMembers) {
      return res.status(400).json({ message: "Social circle is full" });
    }

    referral.socialCircle.members.push(userId);
    await referral.save();

    res.json({
      success: true,
      message: "Joined social circle successfully",
      circle: referral.socialCircle
    });
  } catch (error) {
    console.error("Error joining social circle:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Setup split payment
export const setupSplitPayment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { circleId, splitMethod, participants } = req.body;

    if (!userId || !circleId || !splitMethod || !participants) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const referral = await ReferralModel.findOne({ "socialCircle.circleId": circleId });
    if (!referral) {
      return res.status(400).json({ message: "Social circle not found" });
    }

    if (!referral.socialCircle.members.includes(userId)) {
      return res.status(400).json({ message: "Not a member of this circle" });
    }

    referral.splitPaymentEnabled = true;
    referral.splitMethod = splitMethod;

    res.json({
      success: true,
      message: "Split payment setup successful",
      splitPayment: {
        enabled: referral.splitPaymentEnabled,
        method: referral.splitMethod
      }
    });
  } catch (error) {
    console.error("Error setting up split payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get social circles
export const getSocialCircles = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const circles = await ReferralModel.find({
      $or: [
        { referrerId: userId },
        { "socialCircle.members": userId }
      ]
    }).populate("referrerId", "name email");

    res.json({
      success: true,
      circles: circles.map(circle => ({
        circleId: circle.socialCircle?.circleId,
        circleName: circle.socialCircle?.circleName,
        members: circle.socialCircle?.members || [],
        maxMembers: circle.socialCircle?.maxMembers || 0,
        splitPaymentEnabled: circle.splitPaymentEnabled,
        splitMethod: circle.splitMethod
      }))
    });
  } catch (error) {
    console.error("Error getting social circles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
