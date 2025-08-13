import { Request, Response } from "express";
import { BookingModel } from "../models/Booking.js";
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
}


