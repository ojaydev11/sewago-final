import { Request, Response } from "express";
import { MessageModel } from "../models/Message.js";

export async function listMessages(req: Request, res: Response) {
  const { bookingId } = req.params;
  const userId = req.userId!;
  const messages = await MessageModel.find({ bookingId, $or: [{ fromUserId: userId }, { toUserId: userId }] })
    .sort({ createdAt: 1 })
    .limit(500);
  res.json(messages);
}

export async function sendMessage(req: Request, res: Response) {
  const userId = req.userId!;
  const { bookingId } = req.params;
  const { toUserId, content } = req.body as { toUserId?: string; content: string };
  // For E2E, if toUserId not provided, fallback by flipping between booking parties
  let targetUserId = toUserId;
  if (!targetUserId) {
    const { BookingModel } = await import("../models/Booking.js");
    const booking = await BookingModel.findById(bookingId);
    if (booking) {
      targetUserId = String(booking.userId) === userId ? String(booking.providerId) : String(booking.userId);
    }
  }
  if (!targetUserId) return res.status(400).json({ message: "toUserId required" });
  const message = await MessageModel.create({ bookingId, fromUserId: userId, toUserId: targetUserId, content });
  res.status(201).json(message);
}


