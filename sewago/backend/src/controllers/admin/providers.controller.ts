import { Request, Response } from "express";
import { ProviderModel } from "../../models/Provider.js";
import { BookingModel } from "../../models/Booking.js";
import { NotificationService } from "../../lib/services/NotificationService.js";

export const listProviders = async (req: Request, res: Response) => {
  try {
    const { 
      verified, 
      isOnline, 
      tier, 
      page = 1, 
      limit = 20 
    } = req.query;

    const filter: any = {};
    
    if (verified !== undefined) filter.verified = verified === "true";
    if (isOnline !== undefined) filter.isOnline = isOnline === "true";
    if (tier) filter.tier = tier;

    const skip = (Number(page) - 1) * Number(limit);
    
    const [providers, total] = await Promise.all([
      ProviderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("-__v"),
      ProviderModel.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        providers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error("Error listing providers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list providers",
    });
  }
};

export const getLiveProviders = async (req: Request, res: Response) => {
  try {
    const liveProviders = await ProviderModel.find({ isOnline: true })
      .select("name currentLat currentLng isOnline verified tier skills zones")
      .sort({ verified: -1, tier: 1 });

    res.json({
      success: true,
      data: liveProviders,
    });
  } catch (error) {
    console.error("Error getting live providers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get live providers",
    });
  }
};

export const getProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const provider = await ProviderModel.findById(id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // Get provider's recent bookings
    const recentBookings = await BookingModel.find({ providerId: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "name email phone")
      .populate("serviceId", "name category");

    const providerData = {
      ...provider.toObject(),
      recentBookings,
    };

    res.json({
      success: true,
      data: providerData,
    });
  } catch (error) {
    console.error("Error getting provider:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get provider",
    });
  }
};

export const verifyProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { verified, tier } = req.body;
    
    const updateData: any = {};
    if (verified !== undefined) updateData.verified = verified;
    if (tier) updateData.tier = tier;

    const provider = await ProviderModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // Send notification to provider
    const notificationService = NotificationService.getInstance();
    if (verified) {
      await notificationService.sendToProvider(
        id,
        "Congratulations! Your account has been verified. You can now receive booking assignments.",
        "account_verified",
        "push"
      );
    } else {
      await notificationService.sendToProvider(
        id,
        "Your account verification has been revoked. Please contact support for more information.",
        "account_verification_revoked",
        "push"
      );
    }

    res.json({
      success: true,
      data: provider,
      message: `Provider ${verified ? "verified" : "unverified"} successfully`,
    });
  } catch (error) {
    console.error("Error verifying provider:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify provider",
    });
  }
};

export const pauseProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const provider = await ProviderModel.findByIdAndUpdate(
      id,
      { 
        isOnline: false,
        // Add a paused field if you want to track paused providers
        // paused: true,
        // pauseReason: reason
      },
      { new: true, runValidators: true }
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // Cancel any active bookings for this provider
    const activeBookings = await BookingModel.find({
      providerId: id,
      status: { $in: ["PROVIDER_ASSIGNED", "EN_ROUTE", "IN_PROGRESS"] }
    });

    // Update all active bookings to PENDING_CONFIRMATION and remove provider
    if (activeBookings.length > 0) {
      await BookingModel.updateMany(
        { _id: { $in: activeBookings.map(b => b._id) } },
        { 
          status: "PENDING_CONFIRMATION",
          providerId: null
        }
      );

      // Send notifications to users about cancelled bookings
      const notificationService = NotificationService.getInstance();
      for (const booking of activeBookings) {
        if (booking.userId) {
          await notificationService.sendToUser(
            booking.userId.toString(),
            "Your service provider is temporarily unavailable. We're working to assign you a new provider.",
            "provider_unavailable",
            "push",
            booking._id.toString()
          );
        }
      }
    }

    // Send notification to provider
    const notificationService = NotificationService.getInstance();
    await notificationService.sendToProvider(
      id,
      `Your account has been paused${reason ? `: ${reason}` : ""}. Please contact support for more information.`,
      "account_paused",
      "push"
    );

    res.json({
      success: true,
      data: provider,
      message: "Provider paused successfully",
    });
  } catch (error) {
    console.error("Error pausing provider:", error);
    res.status(500).json({
      success: false,
      message: "Failed to pause provider",
    });
  }
};

export const activateProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const provider = await ProviderModel.findByIdAndUpdate(
      id,
      { 
        isOnline: true,
        // paused: false,
        // pauseReason: null
      },
      { new: true, runValidators: true }
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // Send notification to provider
    const notificationService = NotificationService.getInstance();
    await notificationService.sendToProvider(
      id,
      "Your account has been reactivated. You can now receive new booking assignments.",
      "account_reactivated",
      "push"
    );

    res.json({
      success: true,
      data: provider,
      message: "Provider activated successfully",
    });
  } catch (error) {
    console.error("Error activating provider:", error);
    res.status(500).json({
      success: false,
      message: "Failed to activate provider",
    });
  }
};
