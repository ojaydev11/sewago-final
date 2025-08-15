import { Request, Response } from "express";
import { BookingModel } from "../../models/Booking.js";
import { ProviderModel } from "../../models/Provider.js";
import { UserModel } from "../../models/User.js";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Get booking statistics
    const totalBookings = await BookingModel.countDocuments();
    const pendingBookings = await BookingModel.countDocuments({ status: "PENDING_CONFIRMATION" });
    const activeBookings = await BookingModel.countDocuments({ 
      status: { $in: ["CONFIRMED", "PROVIDER_ASSIGNED", "EN_ROUTE", "IN_PROGRESS"] } 
    });
    const completedBookings = await BookingModel.countDocuments({ status: "COMPLETED" });

    // Get provider statistics
    const totalProviders = await ProviderModel.countDocuments();
    const verifiedProviders = await ProviderModel.countDocuments({ verified: true });
    const onlineProviders = await ProviderModel.countDocuments({ isOnline: true });

    // Get user statistics
    const totalUsers = await UserModel.countDocuments({ role: "user" });

    // Get recent bookings
    const recentBookings = await BookingModel.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "name email")
      .populate("serviceId", "name category")
      .populate("providerId", "name phone");

    // Get live providers with location
    const liveProviders = await ProviderModel.find({ isOnline: true })
      .select("name currentLat currentLng isOnline verified tier");

    const stats = {
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        active: activeBookings,
        completed: completedBookings,
      },
      providers: {
        total: totalProviders,
        verified: verifiedProviders,
        online: onlineProviders,
      },
      users: {
        total: totalUsers,
      },
      recentBookings,
      liveProviders,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard statistics",
    });
  }
};
