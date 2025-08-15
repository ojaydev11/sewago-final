import { ReviewModel } from "../models/Review.js";
import { BookingModel } from "../models/Booking.js";
import { ServiceModel } from "../models/Service.js";
import { NotificationService } from "../lib/services/NotificationService.js";
export async function addReview(req, res) {
    try {
        const userId = req.userId;
        const { bookingId, rating, text, mediaUrls = [] } = req.body;
        if (!bookingId || !rating) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: bookingId, rating"
            });
        }
        // Validate media URLs if provided
        if (mediaUrls && Array.isArray(mediaUrls)) {
            if (mediaUrls.length > 5) {
                return res.status(400).json({
                    success: false,
                    message: "Maximum 5 photos allowed per review"
                });
            }
            // Validate each URL format (basic validation)
            for (const url of mediaUrls) {
                if (typeof url !== 'string' || url.trim() === '') {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid media URL format"
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
        // Create the review
        const review = await ReviewModel.create({
            bookingId,
            userId,
            serviceId: booking.serviceId,
            rating,
            text,
            mediaUrls,
            verified: true, // Reviews are verified by default
        });
        // Update service rating aggregates
        await ServiceModel.findByIdAndUpdate(booking.serviceId, {
            $inc: { ratingCount: 1 },
            $set: {},
        });
        // Send notification to provider about the review
        if (booking.providerId) {
            const notificationService = NotificationService.getInstance();
            await notificationService.sendToProvider(booking.providerId.toString(), `You received a ${rating}-star review for your recent service.`, "new_review", "push", booking._id.toString());
        }
        res.status(201).json({
            success: true,
            data: review,
            message: "Review submitted successfully"
        });
    }
    catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit review"
        });
    }
}
export async function listProviderReviews(req, res) {
    try {
        const { providerId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [reviews, total] = await Promise.all([
            ReviewModel.find({
            // Note: We need to join with bookings to get providerId
            // This might need to be updated based on your actual data structure
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("userId", "name")
                .populate("serviceId", "name category"),
            ReviewModel.countDocuments({
            // Same filter as above
            })
        ]);
        res.json({
            success: true,
            data: {
                reviews,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    }
    catch (error) {
        console.error("Error listing provider reviews:", error);
        res.status(500).json({
            success: false,
            message: "Failed to list reviews"
        });
    }
}
export async function getReview(req, res) {
    try {
        const { id } = req.params;
        const review = await ReviewModel.findById(id)
            .populate("userId", "name")
            .populate("serviceId", "name category")
            .populate("bookingId", "status providerId");
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }
        res.json({
            success: true,
            data: review
        });
    }
    catch (error) {
        console.error("Error getting review:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get review"
        });
    }
}
