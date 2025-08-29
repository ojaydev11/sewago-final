import { Request, Response } from "express";
import { BookingModel } from "../models/Booking.js";
<<<<<<< HEAD
import { Types } from "mongoose";

export async function createBooking(req: Request, res: Response) {
  const userId = req.userId!;
  const { providerId, serviceId, date, timeSlot, price, address, payment } = req.body;
  // Prevent overlapping bookings for same provider/time.
  const overlaps = await BookingModel.exists({
    providerId: new Types.ObjectId(providerId),
    date: new Date(date),
    timeSlot,
    status: { $in: ["pending", "accepted", "in-progress"] as any },
  });
  if (overlaps) return res.status(409).json({ message: "slot_unavailable" });
  const booking = await BookingModel.create({
    userId,
    providerId,
    serviceId,
    date,
    timeSlot,
    price,
    address,
    payment: { method: "cash", status: "pending", ...(payment ?? {}) },
  });
  res.status(201).json(booking);
}

export async function listMyBookings(req: Request, res: Response) {
  const userId = req.userId!;
  const role = req.userRole;
  const filter: any = role === "provider" ? { providerId: userId } : { userId };
  const bookings = await BookingModel.find(filter).sort({ createdAt: -1 });
  res.json(bookings);
}

export async function getBooking(req: Request, res: Response) {
  const booking = await BookingModel.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "not_found" });
  res.json(booking);
}

export async function updateBookingStatus(req: Request, res: Response) {
  const userId = req.userId!;
  const role = req.userRole!;
  const { id } = req.params;
  const { status } = req.body as { status: "accepted" | "in-progress" | "completed" | "cancelled" };
  const filter: any = role === "provider" ? { _id: id, providerId: userId } : { _id: id, userId };
  const update: any = { status };
  if (status === "completed") update["payment.status"] = "paid";
  const booking = await BookingModel.findOneAndUpdate(filter, update, { new: true });
  if (!booking) return res.status(404).json({ message: "Not found" });
  res.json(booking);
=======
import { UserModel } from "../models/User.js";
import { NotificationModel } from "../models/Notification.js";
import { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Create booking with smart scheduling
export async function createBooking(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { 
      providerId, 
      serviceId, 
      scheduledAt, 
      estimatedDuration = 60,
      address,
      coordinates,
      notes,
      urgency = "MEDIUM",
      paymentMethod = "WALLET",
      basePrice,
      total
    } = req.body;

    if (!userId || !providerId || !serviceId || !scheduledAt || !address) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields" 
      });
    }

    // Check if provider exists and is available
    const provider = await UserModel.findById(providerId);
    if (!provider || provider.role !== "provider") {
      return res.status(404).json({ 
        success: false,
        message: "Provider not found" 
      });
    }

    if (!provider.canReceiveBookings()) {
      return res.status(400).json({ 
        success: false,
        message: "Provider is not available for bookings" 
      });
    }

    // Calculate slot times
    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + estimatedDuration * 60000);

    // Check for time conflicts
    const conflicts = await checkTimeConflicts(providerId, startTime, endTime);
    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Time slot conflicts detected",
        conflicts
      });
    }

    // Check provider availability for the requested time
    const isAvailable = await checkProviderAvailability(providerId, startTime, endTime);
    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: "Provider is not available at the requested time"
      });
    }

    // Create the booking with slot management
    const booking = await BookingModel.create({
      userId,
      serviceId,
      providerId,
      address,
      coordinates,
      notes,
      urgency,
      basePrice: basePrice || 0,
      total: total || basePrice || 0,
      paymentMethod,
      scheduledAt: startTime,
      estimatedDuration,
      slot: {
        startTime,
        endTime,
        duration: estimatedDuration,
        isLocked: false,
        timezone: provider.provider?.availability?.timezone || "Asia/Kathmandu"
      },
      status: "PENDING_CONFIRMATION"
    });

    // Send notification to provider
    await NotificationModel.create({
      userId: providerId,
      title: "New Booking Request",
      message: `You have a new booking request for ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}`,
      type: "BOOKING_REQUEST",
      priority: urgency === "EMERGENCY" ? "HIGH" : "NORMAL",
      channels: [
        { channel: "IN_APP", status: "PENDING" },
        { channel: "PUSH", status: "PENDING" }
      ],
      metadata: {
        bookingId: booking._id,
        scheduledAt: startTime,
        estimatedDuration,
        urgency
      },
      tags: ["booking", "request", "provider"]
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: {
        id: booking._id,
        status: booking.status,
        scheduledAt: booking.slot.startTime,
        estimatedDuration: booking.slot.duration
      }
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}

// Get provider available slots
export async function getProviderSlots(req: Request, res: Response) {
  try {
    const { id: providerId } = req.params;
    const { date, duration = 60 } = req.query;

    if (!providerId) {
      return res.status(400).json({ 
        success: false,
        message: "Provider ID is required" 
      });
    }

    // Check if provider exists and is available
    const provider = await UserModel.findById(providerId);
    if (!provider || provider.role !== "provider") {
      return res.status(404).json({ 
        success: false,
        message: "Provider not found" 
      });
    }

    if (!provider.canReceiveBookings()) {
      return res.status(400).json({ 
        success: false,
        message: "Provider is not available for bookings" 
      });
    }

    const targetDate = date ? new Date(date as string) : new Date();
    const slots = await generateAvailableSlots(providerId, targetDate, Number(duration));

    res.json({
      success: true,
      provider: {
        id: provider._id,
        name: provider.displayName,
        businessName: provider.provider?.businessName,
        isVerified: provider.provider?.isVerified
      },
      date: targetDate.toISOString().split('T')[0],
      duration: Number(duration),
      availableSlots: slots,
      workingHours: provider.provider?.availability?.workingHours,
      timezone: provider.provider?.availability?.timezone || "Asia/Kathmandu"
    });

  } catch (error) {
    console.error("Error getting provider slots:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}

// Lock provider slot for booking
export async function lockProviderSlot(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { id: providerId } = req.params;
    const { startTime, duration = 60 } = req.body;

    if (!userId || !startTime || !duration) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields" 
      });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);

    // Check if slot is available
    const conflicts = await checkTimeConflicts(providerId, start, end);
    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Slot is no longer available",
        conflicts
      });
    }

    // Create temporary slot lock
    const lockId = `lock_${userId}_${Date.now()}`;
    const lockExpiresAt = new Date(Date.now() + 120000); // 120 seconds

    // Store lock in Redis or temporary collection
    // For now, we'll use a temporary approach
    const existingBookings = await BookingModel.find({
      providerId,
      "slot.startTime": { $lt: end },
      "slot.endTime": { $gt: start },
      status: { $nin: ["CANCELED", "COMPLETED"] }
    });

    if (existingBookings.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Slot is no longer available"
      });
    }

    res.json({
      success: true,
      message: "Slot locked successfully",
      lockId,
      lockExpiresAt,
      slot: {
        startTime: start,
        endTime: end,
        duration
      }
    });

  } catch (error) {
    console.error("Error locking provider slot:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}

// Unlock provider slot
export async function unlockProviderSlot(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { id: providerId } = req.params;
    const { lockId } = req.body;

    if (!userId || !lockId) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields" 
      });
    }

    // Release the slot lock
    // In a production system, this would interact with Redis
    res.json({
      success: true,
      message: "Slot unlocked successfully"
    });

  } catch (error) {
    console.error("Error unlocking provider slot:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}

// Reschedule booking
export async function rescheduleBooking(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { id: bookingId } = req.params;
    const { newStartTime, newEndTime, reason } = req.body;

    if (!userId || !newStartTime || !newEndTime) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields" 
      });
    }

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    // Check if user can reschedule this booking
    if (booking.userId.toString() !== userId && booking.providerId.toString() !== userId) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to reschedule this booking" 
      });
    }

    // Check if booking can be rescheduled
    if (!booking.canReschedule()) {
      return res.status(400).json({ 
        success: false,
        message: "Booking cannot be rescheduled" 
      });
    }

    const newStart = new Date(newStartTime);
    const newEnd = new Date(newEndTime);

    // Check for conflicts with new time
    const conflicts = await checkTimeConflicts(booking.providerId, newStart, newEnd, bookingId);
    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: "New time slot has conflicts",
        conflicts
      });
    }

    // Perform reschedule
    const rescheduleSuccess = booking.reschedule(newStart, newEnd, reason, userId);
    if (!rescheduleSuccess) {
      return res.status(400).json({ 
        success: false,
        message: "Failed to reschedule booking" 
      });
    }

    await booking.save();

    // Send notification to the other party
    const notificationUserId = booking.userId.toString() === userId ? booking.providerId : booking.userId;
    await NotificationModel.create({
      userId: notificationUserId,
      title: "Booking Rescheduled",
      message: `Your booking has been rescheduled to ${newStart.toLocaleDateString()} at ${newStart.toLocaleTimeString()}`,
      type: "BOOKING_RESCHEDULED",
      priority: "NORMAL",
      channels: [
        { channel: "IN_APP", status: "PENDING" },
        { channel: "PUSH", status: "PENDING" }
      ],
      metadata: {
        bookingId: booking._id,
        oldTime: booking.rescheduling.originalSlot?.startTime,
        newTime: newStart,
        reason
      },
      tags: ["booking", "rescheduled"]
    });

    res.json({
      success: true,
      message: "Booking rescheduled successfully",
      booking: {
        id: booking._id,
        newStartTime: newStart,
        newEndTime: newEnd,
        rescheduleCount: booking.rescheduling.rescheduleCount
      }
    });

  } catch (error) {
    console.error("Error rescheduling booking:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}

// List user's bookings
export async function listMyBookings(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20, status, role } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = {};

    // Filter by role (user or provider)
    if (role === "provider") {
      filter.providerId = userId;
    } else {
      filter.userId = userId;
    }

    // Filter by status if provided
    if (status) {
      filter.status = status;
    }

    const bookings = await BookingModel.find(filter)
      .populate("providerId", "name provider.businessName")
      .populate("serviceId", "name category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await BookingModel.countDocuments(filter);

    res.json({
      success: true,
      bookings: bookings.map(booking => ({
        id: booking._id,
        status: booking.status,
        scheduledAt: booking.slot?.startTime,
        estimatedDuration: booking.slot?.duration,
        address: booking.address,
        total: booking.total,
        provider: booking.providerId,
        service: booking.serviceId,
        createdAt: booking.createdAt
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error("Error listing bookings:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}

// Get specific booking
export async function getBooking(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { id: bookingId } = req.params;

    if (!userId || !bookingId) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields" 
      });
    }

    const booking = await BookingModel.findById(bookingId)
      .populate("userId", "name email phone")
      .populate("providerId", "name provider.businessName provider.phone")
      .populate("serviceId", "name category description");

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    // Check if user can view this booking
    if (booking.userId._id.toString() !== userId && booking.providerId._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to view this booking" 
      });
    }

    res.json({
      success: true,
      booking: {
        id: booking._id,
        status: booking.status,
        scheduledAt: booking.slot?.startTime,
        estimatedDuration: booking.slot?.duration,
        address: booking.address,
        coordinates: booking.coordinates,
        notes: booking.notes,
        urgency: booking.urgency,
        basePrice: booking.basePrice,
        total: booking.total,
        paymentMethod: booking.paymentMethod,
        user: booking.userId,
        provider: booking.providerId,
        service: booking.serviceId,
        rescheduling: booking.rescheduling,
        conflicts: booking.conflicts,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }
    });

  } catch (error) {
    console.error("Error getting booking:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}

// Update booking status
export async function updateBookingStatus(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { id: bookingId } = req.params;
    const { status, notes } = req.body;

    if (!userId || !status) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields" 
      });
    }

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    // Check if user can update this booking
    if (booking.userId.toString() !== userId && booking.providerId.toString() !== userId) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to update this booking" 
      });
    }

    // Validate status transition
    const validTransitions = getValidStatusTransitions(booking.status, userId === booking.providerId.toString());
    if (!validTransitions.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid status transition from ${booking.status} to ${status}` 
      });
    }

    // Update booking status
    const oldStatus = booking.status;
    booking.status = status;

    // Handle specific status updates
    if (status === "COMPLETED") {
      booking.completedAt = new Date();
    }

    if (notes) {
      booking.notes = (booking.notes || "") + `\n[${new Date().toISOString()}] ${notes}`;
    }

    await booking.save();

    // Send notification to the other party
    const notificationUserId = booking.userId.toString() === userId ? booking.providerId : booking.userId;
    await NotificationModel.create({
      userId: notificationUserId,
      title: `Booking ${status.toLowerCase()}`,
      message: `Your booking status has been updated to ${status.toLowerCase()}`,
      type: "BOOKING_STATUS_UPDATED",
      priority: "NORMAL",
      channels: [
        { channel: "IN_APP", status: "PENDING" },
        { channel: "PUSH", status: "PENDING" }
      ],
      metadata: {
        bookingId: booking._id,
        oldStatus,
        newStatus: status,
        updatedBy: userId
      },
      tags: ["booking", "status", "update"]
    });

    res.json({
      success: true,
      message: "Booking status updated successfully",
      booking: {
        id: booking._id,
        status: booking.status,
        updatedAt: booking.updatedAt
      }
    });

  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}

// Helper function to check time conflicts
async function checkTimeConflicts(providerId: string, startTime: Date, endTime: Date, excludeBookingId?: string) {
  const filter: any = {
    providerId: new Types.ObjectId(providerId),
    "slot.startTime": { $lt: endTime },
    "slot.endTime": { $gt: startTime },
    status: { $nin: ["CANCELED", "COMPLETED"] }
  };

  if (excludeBookingId) {
    filter._id = { $ne: new Types.ObjectId(excludeBookingId) };
  }

  const conflicts = await BookingModel.find(filter)
    .select("_id slot.startTime slot.endTime status")
    .sort({ "slot.startTime": 1 });

  return conflicts.map(conflict => ({
    bookingId: conflict._id,
    startTime: conflict.slot.startTime,
    endTime: conflict.slot.endTime,
    status: conflict.status
  }));
}

// Helper function to check provider availability
async function checkProviderAvailability(providerId: string, startTime: Date, endTime: Date) {
  const provider = await UserModel.findById(providerId);
  if (!provider?.provider?.availability) return false;

  const availability = provider.provider.availability;
  if (!availability.isAvailable) return false;

  // Check working hours
  const dayOfWeek = startTime.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const workingDay = availability.workingHours[dayOfWeek as keyof typeof availability.workingHours];
  
  if (!workingDay?.isWorking) return false;

  // Check if time is within working hours
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  const [workStart] = workingDay.start.split(':').map(Number);
  const [workEnd] = workingDay.end.split(':').map(Number);

  if (startHour < workStart || endHour > workEnd) return false;

  return true;
}

// Helper function to generate available slots
async function generateAvailableSlots(providerId: string, date: Date, duration: number) {
  const provider = await UserModel.findById(providerId);
  if (!provider?.provider?.availability) return [];

  const availability = provider.provider.availability;
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const workingDay = availability.workingHours[dayOfWeek as keyof typeof availability.workingHours];

  if (!workingDay?.isWorking) return [];

  const [workStart] = workingDay.start.split(':').map(Number);
  const [workEnd] = workingDay.end.split(':').map(Number);

  const slots = [];
  const slotDuration = duration;
  const currentTime = new Date(date);
  currentTime.setHours(workStart, 0, 0, 0);

  while (currentTime.getHours() < workEnd - Math.ceil(slotDuration / 60)) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);

    // Check if slot has conflicts
    const conflicts = await checkTimeConflicts(providerId, slotStart, slotEnd);
    if (conflicts.length === 0) {
      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        duration: slotDuration,
        available: true
      });
    }

    // Move to next slot (30-minute intervals)
    currentTime.setMinutes(currentTime.getMinutes() + 30);
  }

  return slots;
}

// Helper function to get valid status transitions
function getValidStatusTransitions(currentStatus: string, isProvider: boolean) {
  const transitions: { [key: string]: string[] } = {
    "PENDING_CONFIRMATION": isProvider ? ["CONFIRMED", "CANCELED"] : ["CANCELED"],
    "CONFIRMED": isProvider ? ["PROVIDER_ASSIGNED", "CANCELED"] : ["CANCELED"],
    "PROVIDER_ASSIGNED": isProvider ? ["EN_ROUTE", "CANCELED"] : ["CANCELED"],
    "EN_ROUTE": isProvider ? ["IN_PROGRESS", "CANCELED"] : ["CANCELED"],
    "IN_PROGRESS": isProvider ? ["COMPLETED", "CANCELED"] : ["CANCELED"],
    "COMPLETED": [],
    "CANCELED": [],
    "DISPUTED": isProvider ? ["IN_PROGRESS", "CANCELED"] : ["CANCELED"],
    "RESCHEDULED": isProvider ? ["CONFIRMED", "CANCELED"] : ["CANCELED"]
  };

  return transitions[currentStatus] || [];
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
}


