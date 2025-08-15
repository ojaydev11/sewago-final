import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as Auth from "../controllers/auth.controller.js";
import * as Services from "../controllers/services.controller.js";
import * as Bookings from "../controllers/bookings.controller.js";
import * as Reviews from "../controllers/reviews.controller.js";
import * as Messages from "../controllers/messages.controller.js";
import * as AI from "../controllers/ai.controller.js";
import * as Payments from "../controllers/payments.controller.js";
import * as Meta from "../controllers/meta.controller.js";
import * as Tracking from "../controllers/tracking.controller.js";
import * as Admin from "./admin.js";
import uploadRouter from "./upload.js";
export const api = Router();
// Health
api.get("/health", (_req, res) => res.json({ ok: true, service: "sewago-backend", env: process.env.NODE_ENV ?? "development" }));
// Auth
api.post("/auth/register", Auth.register);
api.post("/auth/login", Auth.login);
api.post("/auth/refresh", Auth.refresh);
api.post("/auth/logout", Auth.logout);
api.get("/auth/me", requireAuth(["user", "provider", "admin"]), Auth.me);
// Services
api.get("/services", Services.listServices);
api.get("/services/:id", Services.getService);
api.post("/services", requireAuth(["provider", "admin"]), Services.createService);
api.patch("/services/:id", requireAuth(["provider", "admin"]), Services.updateService);
api.delete("/services/:id", requireAuth(["provider", "admin"]), Services.deleteService);
// Bookings
api.post("/bookings", requireAuth(["user"]), Bookings.createBooking);
api.get("/bookings/me", requireAuth(["user", "provider"]), Bookings.listMyBookings);
api.patch("/bookings/:id/status", requireAuth(["user", "provider"]), Bookings.updateBookingStatus);
api.get("/bookings/:id", requireAuth(["user", "provider", "admin"]), Bookings.getBooking);
// Reviews
api.post("/reviews", requireAuth(["user"]), Reviews.addReview);
api.get("/reviews/provider/:providerId", Reviews.listProviderReviews);
// Messages
api.get("/messages/:bookingId", requireAuth(["user", "provider"]), Messages.listMessages);
api.post("/messages/:bookingId", requireAuth(["user", "provider"]), Messages.sendMessage);
// AI
api.get("/ai/suggest", AI.suggest);
// Payments
api.post("/payments/esewa/initiate", requireAuth(["user"]), Payments.esewaInitiate);
api.post("/payments/khalti/initiate", requireAuth(["user"]), Payments.khaltiInitiate);
// Provider Location API
api.post("/provider/location", requireAuth(["provider"]), Tracking.updateProviderLocation);
api.post("/provider/status", requireAuth(["provider"]), Tracking.updateProviderStatus);
// Admin routes
api.use("/admin", Admin.adminRouter);
// Admin test-only endpoints (protected by header X-Seed-Key)
api.post("/admin/seed", async (req, res) => {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEEDING !== "true") {
        return res.status(403).json({ message: "disabled_in_production" });
    }
    const key = req.header("X-Seed-Key");
    if (key !== (process.env.SEED_KEY ?? "dev-seed-key"))
        return res.status(403).json({ message: "forbidden" });
    const { UserModel } = await import("../models/User.js");
    const { ServiceModel } = await import("../models/Service.js");
    const bcrypt = (await import("bcrypt")).default;
    const upsertUser = async (doc) => {
        const existing = await UserModel.findOne({ email: doc.email });
        if (existing)
            return existing;
        const passwordHash = await bcrypt.hash(doc.password ?? "password123", 12);
        return UserModel.create({ ...doc, passwordHash });
    };
    const provider = await upsertUser({
        name: "Provider One",
        email: "provider1@example.com",
        phone: "9800000001",
        role: "provider",
        provider: { businessName: "Pro One", categories: ["plumbing"], description: "Plumbing services", baseLocation: "Kathmandu", pricePerHour: 1000, isVerified: true },
    });
    const user = await upsertUser({
        name: "User One",
        email: "user1@example.com",
        phone: "9800000002",
        role: "user",
    });
    const existingService = await ServiceModel.findOne({ providerId: provider._id });
    const service = existingService ?? (await ServiceModel.create({
        title: "Basic Plumbing",
        description: "Fix leaks and clogs",
        basePrice: 1500,
        images: [],
        location: "Kathmandu",
        providerId: provider._id,
    }));
    res.json({ ok: true, userId: user._id, providerId: provider._id, serviceId: service._id });
});
api.post("/admin/make-provider", async (req, res) => {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEEDING !== "true") {
        return res.status(403).json({ message: "disabled_in_production" });
    }
    const key = req.header("X-Seed-Key");
    if (key !== (process.env.SEED_KEY ?? "dev-seed-key"))
        return res.status(403).json({ message: "forbidden" });
    const { userId } = req.query;
    if (!userId)
        return res.status(400).json({ message: "userId required" });
    const { UserModel } = await import("../models/User.js");
    await UserModel.updateOne({ _id: userId }, { $set: { role: "provider" } });
    res.json({ ok: true });
});
// Meta
api.get("/meta/categories", Meta.listCategories);
api.get("/categories", Meta.listCategories);
// Tracking
api.post("/tracking/location", requireAuth(["provider"]), Tracking.updateProviderLocation);
api.post("/tracking/status", requireAuth(["provider"]), Tracking.updateProviderStatus);
api.get("/tracking/:bookingId", requireAuth(["user", "provider"]), Tracking.getTrackingInfo);
api.get("/tracking/:bookingId/eta", requireAuth(["user", "provider"]), Tracking.getETA);
// File Upload
api.use("/upload", uploadRouter);
