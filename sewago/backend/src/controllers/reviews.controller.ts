import { Request, Response } from "express";
import { ReviewModel } from "../models/Review.js";
import { BookingModel } from "../models/Booking.js";
import { ServiceModel } from "../models/Service.js";
import { NotificationService } from "../lib/services/NotificationService.js";
import { NotificationModel } from "../models/Notification.js";
import { v4 as uuidv4 } from "uuid";

export async function addReview(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { 
      bookingId, 
      rating, 
      comment, 
      photos = [],
      reviewSource = "POST_COMPLETION"
    } = req.body as { 
      bookingId: string; 
      rating: number; 
      comment?: string;
      photos?: Array<{
        photoUrl: string;
        exifData?: any;
      }>;
      reviewSource?: string;
    };

    if (!bookingId || !rating) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields: bookingId, rating" 
      });
    }

    // Validate photos if provided
    if (photos && Array.isArray(photos)) {
      if (photos.length > 5) {
        return res.status(400).json({ 
          success: false,
          message: "Maximum 5 photos allowed per review" 
        });
      }

      // Validate each photo
      for (const photo of photos) {
        if (!photo.photoUrl || typeof photo.photoUrl !== 'string' || photo.photoUrl.trim() === '') {
          return res.status(400).json({ 
            success: false,
            message: "Invalid photo URL format" 
          });
        }
      }
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false,
        message: "Rating must be between 1 and 5" 
      });
    }

    // Verify the booking exists and is completed
    const booking = await BookingModel.findOne({ 
      _id: bookingId, 
      userId, 
      status: "COMPLETED" 
    });

    if (!booking) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid booking or booking not completed" 
      });
    }

    // Check if review already exists for this booking
    const existingReview = await ReviewModel.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ 
        success: false,
        message: "Review already exists for this booking" 
      });
    }

    // Create the review with enhanced features
    const review = await ReviewModel.create({
      bookingId,
      userId,
      providerId: booking.providerId,
      rating,
      comment,
      reviewSource,
      photos: photos.map(photo => ({
        photoUrl: photo.photoUrl,
        photoId: uuidv4(),
        uploadedAt: new Date(),
        exifData: photo.exifData
      })),
      moderationStatus: photos.length > 0 ? "PENDING" : "APPROVED", // Auto-approve if no photos
      isVerified: photos.length === 0 // Auto-verify if no photos
    });

    // Update service rating aggregates
    await ServiceModel.findByIdAndUpdate(booking.serviceId, {
      $inc: { ratingCount: 1 },
      $set: {},
    });

    // Send notification to provider about the review
    if (booking.providerId) {
      const notificationService = NotificationService.getInstance();
      await notificationService.sendToProvider(
        booking.providerId.toString(),
        `You received a ${rating}-star review for your recent service.`,
        "new_review",
        "push",
        booking._id.toString()
      );

      // Create enhanced notification
      await NotificationModel.create({
        userId: booking.providerId.toString(),
        title: "New Review Received",
        message: `You received a ${rating}-star review for your recent service.`,
        type: "REVIEW_RECEIVED",
        priority: "NORMAL",
        channels: [
          { channel: "IN_APP", status: "PENDING" },
          { channel: "PUSH", status: "PENDING" }
        ],
        metadata: {
          reviewId: review._id,
          rating,
          hasPhotos: photos.length > 0
        },
        tags: ["review", "provider", "rating"]
      });
    }

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: {
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        photos: review.photos,
        moderationStatus: review.moderationStatus,
        isVerified: review.isVerified,
        createdAt: review.createdAt
      }
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}

export async function listProviderReviews(req: Request, res: Response) {
  try {
    const { providerId } = req.params;
    const { page = 1, limit = 20, verifiedOnly = true } = req.query;

    if (!providerId) {
      return res.status(400).json({ 
        success: false,
        message: "Provider ID is required" 
      });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = { providerId };

    // Filter by verification status if requested
    if (verifiedOnly === "true") {
      filter.isVerified = true;
      filter.moderationStatus = "APPROVED";
      filter.isFlagged = false;
    }

    const reviews = await ReviewModel.find(filter)
      .populate("userId", "name avatarUrl")
      .populate("bookingId", "address scheduledAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ReviewModel.countDocuments(filter);

    // Calculate average rating
    const ratingStats = await ReviewModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating"
          }
        }
      }
    ]);

    const stats = ratingStats[0] || { averageRating: 0, totalReviews: 0, ratingDistribution: [] };
    
    // Calculate rating distribution
    const distribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: stats.ratingDistribution.filter((r: number) => r === rating).length
    }));

    res.json({
      success: true,
      reviews: reviews.map(review => ({
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        photos: review.photos,
        isVerified: review.isVerified,
        createdAt: review.createdAt,
        user: review.userId,
        booking: review.bookingId
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      stats: {
        averageRating: Math.round(stats.averageRating * 10) / 10,
        totalReviews: stats.totalReviews,
        ratingDistribution: distribution
      }
    });
  } catch (error) {
    console.error("Error listing provider reviews:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}

// Get reviews pending moderation (Admin only)
export async function getPendingModeration(req: Request, res: Response) {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const filter: any = { moderationStatus: status || "PENDING" };
    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await ReviewModel.find(filter)
      .populate("userId", "name email")
      .populate("providerId", "name businessName")
      .populate("bookingId", "address scheduledAt")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ReviewModel.countDocuments(filter);

    res.json({
      success: true,
      reviews: reviews.map(review => ({
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        photos: review.photos,
        moderationStatus: review.moderationStatus,
        spamScore: review.spamScore,
        isFlagged: review.isFlagged,
        createdAt: review.createdAt,
        user: review.userId,
        provider: review.providerId,
        booking: review.bookingId
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Error getting pending moderation:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}

// Admin: Approve review
export async function approveReview(req: Request, res: Response) {
  try {
    const { reviewId } = req.params;
    const adminId = (req as any).userId;

    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: "Review not found" 
      });
    }

    review.moderationStatus = "APPROVED";
    review.moderatedBy = adminId;
    review.moderatedAt = new Date();
    await review.save();
    const success = true;
    if (!success) {
      return res.status(400).json({ 
        success: false,
        message: "Failed to approve review" 
      });
    }

    res.json({
      success: true,
      message: "Review approved successfully",
      review: {
        id: review._id,
        moderationStatus: review.moderationStatus,
        isVerified: review.isVerified
      }
    });
  } catch (error) {
    console.error("Error approving review:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}

// Admin: Reject review
export async function rejectReview(req: Request, res: Response) {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;
    const adminId = (req as any).userId;

    if (!reason) {
      return res.status(400).json({ 
        success: false,
        message: "Rejection reason is required" 
      });
    }

    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: "Review not found" 
      });
    }

    review.moderationStatus = "REJECTED";
    review.moderatedBy = adminId;
    review.moderatedAt = new Date();
    review.rejectionReason = reason;
    await review.save();
    const success = true;
    if (!success) {
      return res.status(400).json({ 
        success: false,
        message: "Failed to reject review" 
      });
    }

    res.json({
      success: true,
      message: "Review rejected successfully",
      review: {
        id: review._id,
        moderationStatus: review.moderationStatus,
        moderationNotes: review.moderationNotes
      }
    });
  } catch (error) {
    console.error("Error rejecting review:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}

// Flag review for moderation
export async function flagReview(req: Request, res: Response) {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;
    const userId = (req as any).userId;

    if (!reason) {
      return res.status(400).json({ 
        success: false,
        message: "Flag reason is required" 
      });
    }

    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: "Review not found" 
      });
    }

    if (!review.flags) review.flags = [];
    (review.flags as any).push({
      reason,
      flaggedBy: userId,
      flaggedAt: new Date()
    });
    review.isFlagged = true;
    await review.save();
    const success = true;
    if (!success) {
      return res.status(400).json({ 
        success: false,
        message: "Failed to flag review" 
      });
    }

    res.json({
      success: true,
      message: "Review flagged successfully",
      review: {
        id: review._id,
        isFlagged: review.isFlagged,
        flagReason: review.flagReason
      }
    });
  } catch (error) {
    console.error("Error flagging review:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}


