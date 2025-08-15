import { Request, Response } from "express";
import { BookingModel } from "../../models/Booking.js";
import { ProviderModel } from "../../models/Provider.js";
import { NotificationService } from "../../lib/services/NotificationService.js";

export const listBookings = async (req: Request, res: Response) => {
  try {
    const { 
      status, 
      page = 1, 
      limit = 20, 
      providerId, 
      startDate, 
      endDate 
    } = req.query;

    const filter: any = {};
    
    if (status) filter.status = status;
    if (providerId) filter.providerId = providerId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [bookings, total] = await Promise.all([
      BookingModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("userId", "name email phone")
        .populate("serviceId", "name category basePrice")
        .populate("providerId", "name phone verified"),
      BookingModel.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error("Error listing bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list bookings",
    });
  }
};

export const getBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const booking = await BookingModel.findById(id)
      .populate("userId", "name email phone")
      .populate("serviceId", "name category basePrice description")
      .populate("providerId", "name phone verified skills zones");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error getting booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get booking",
    });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.userId;
    delete updateData.serviceId;
    
    const booking = await BookingModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("userId", "name email phone")
     .populate("serviceId", "name category basePrice")
     .populate("providerId", "name phone verified");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Send notification about booking update
    const notificationService = NotificationService.getInstance();
    if (booking.userId) {
      await notificationService.sendToUser(
        booking.userId.toString(),
        `Your booking has been updated. New status: ${booking.status}`,
        "booking_update",
        "push",
        booking._id.toString()
      );
    }

    res.json({
      success: true,
      data: booking,
      message: "Booking updated successfully",
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking",
    });
  }
};

export const assignProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { providerId } = req.body;
    
    if (!providerId) {
      return res.status(400).json({
        success: false,
        message: "Provider ID is required",
      });
    }

    // Verify provider exists and is verified
    const provider = await ProviderModel.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    if (!provider.verified) {
      return res.status(400).json({
        success: false,
        message: "Provider must be verified before assignment",
      });
    }

    const booking = await BookingModel.findByIdAndUpdate(
      id,
      { 
        providerId,
        status: "PROVIDER_ASSIGNED"
      },
      { new: true, runValidators: true }
    ).populate("userId", "name email phone")
     .populate("serviceId", "name category basePrice")
     .populate("providerId", "name phone verified");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Send notifications
    const notificationService = NotificationService.getInstance();
    
    if (booking.userId) {
      await notificationService.sendToUser(
        booking.userId.toString(),
        `A provider has been assigned to your booking. They will contact you soon.`,
        "provider_assigned",
        "push",
        booking._id.toString()
      );
    }

    if (providerId) {
      await notificationService.sendToProvider(
        providerId,
        `You have been assigned a new booking. Please review the details and contact the customer.`,
        "new_booking_assignment",
        "push",
        booking._id.toString()
      );
    }

    res.json({
      success: true,
      data: booking,
      message: "Provider assigned successfully",
    });
  } catch (error) {
    console.error("Error assigning provider:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign provider",
    });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = [
      "PENDING_CONFIRMATION",
      "CONFIRMED",
      "PROVIDER_ASSIGNED",
      "EN_ROUTE",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELED",
      "DISPUTED"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const updateData: any = { status };
    
    // Set completion time if status is COMPLETED
    if (status === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    const booking = await BookingModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("userId", "name email phone")
     .populate("serviceId", "name category basePrice")
     .populate("providerId", "name phone verified");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Send notifications based on status change
    const notificationService = NotificationService.getInstance();
    
    if (booking.userId) {
      let message = "";
      switch (status) {
        case "CONFIRMED":
          message = "Your booking has been confirmed!";
          break;
        case "EN_ROUTE":
          message = "Your provider is on the way!";
          break;
        case "IN_PROGRESS":
          message = "Your service is now in progress.";
          break;
        case "COMPLETED":
          message = "Your service has been completed. Please leave a review!";
          break;
        default:
          message = `Your booking status has been updated to: ${status}`;
      }

      await notificationService.sendToUser(
        booking.userId.toString(),
        message,
        "booking_status_update",
        "push",
        booking._id.toString()
      );
    }

    res.json({
      success: true,
      data: booking,
      message: "Booking status updated successfully",
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking status",
    });
  }
};
