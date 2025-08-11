import { Request, Response } from "express";
import { ReviewModel } from "../models/Review.js";
import { BookingModel } from "../models/Booking.js";
import { ServiceModel } from "../models/Service.js";

export async function addReview(req: Request, res: Response) {
  const userId = req.userId!;
  const { bookingId, rating, comment } = req.body as { bookingId: string; rating: number; comment?: string };
  const booking = await BookingModel.findOne({ _id: bookingId, userId, status: "completed" });
  if (!booking) return res.status(400).json({ message: "Invalid booking" });
  const review = await ReviewModel.create({
    bookingId,
    userId,
    providerId: booking.providerId,
    rating,
    comment,
  });
  // Update aggregates
  await ServiceModel.findByIdAndUpdate(booking.serviceId, {
    $inc: { ratingCount: 1 },
    $set: {},
  });
  res.status(201).json(review);
}

export async function listProviderReviews(req: Request, res: Response) {
  const { providerId } = req.params;
  const reviews = await ReviewModel.find({ providerId }).sort({ createdAt: -1 }).limit(100);
  res.json(reviews);
}


