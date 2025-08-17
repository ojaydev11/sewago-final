"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
const Auth = __importStar(require("../controllers/auth.controller.js"));
const Services = __importStar(require("../controllers/services.controller.js"));
const Bookings = __importStar(require("../controllers/bookings.controller.js"));
const Reviews = __importStar(require("../controllers/reviews.controller.js"));
const Messages = __importStar(require("../controllers/messages.controller.js"));
const AI = __importStar(require("../controllers/ai.controller.js"));
const Payments = __importStar(require("../controllers/payments.controller.js"));
const Meta = __importStar(require("../controllers/meta.controller.js"));
const Tracking = __importStar(require("../controllers/tracking.controller.js"));
const Admin = __importStar(require("./admin.js"));
const upload_js_1 = __importDefault(require("./upload.js"));
exports.api = (0, express_1.Router)();
// Health
exports.api.get("/health", (_req, res) => { var _a; return res.json({ ok: true, service: "sewago-backend", env: (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : "development" }); });
// Auth
exports.api.post("/auth/register", Auth.register);
exports.api.post("/auth/login", Auth.login);
exports.api.post("/auth/refresh", Auth.refresh);
exports.api.post("/auth/logout", Auth.logout);
exports.api.get("/auth/me", (0, auth_js_1.requireAuth)(["user", "provider", "admin"]), Auth.me);
// Services
exports.api.get("/services", Services.listServices);
exports.api.get("/services/:id", Services.getService);
exports.api.post("/services", (0, auth_js_1.requireAuth)(["provider", "admin"]), Services.createService);
exports.api.patch("/services/:id", (0, auth_js_1.requireAuth)(["provider", "admin"]), Services.updateService);
exports.api.delete("/services/:id", (0, auth_js_1.requireAuth)(["provider", "admin"]), Services.deleteService);
// Bookings
exports.api.post("/bookings", (0, auth_js_1.requireAuth)(["user"]), Bookings.createBooking);
exports.api.get("/bookings/me", (0, auth_js_1.requireAuth)(["user", "provider"]), Bookings.listMyBookings);
exports.api.patch("/bookings/:id/status", (0, auth_js_1.requireAuth)(["user", "provider"]), Bookings.updateBookingStatus);
exports.api.get("/bookings/:id", (0, auth_js_1.requireAuth)(["user", "provider", "admin"]), Bookings.getBooking);
// Reviews
exports.api.post("/reviews", (0, auth_js_1.requireAuth)(["user"]), Reviews.addReview);
exports.api.get("/reviews/provider/:providerId", Reviews.listProviderReviews);
// Messages
exports.api.get("/messages/:bookingId", (0, auth_js_1.requireAuth)(["user", "provider"]), Messages.listMessages);
exports.api.post("/messages/:bookingId", (0, auth_js_1.requireAuth)(["user", "provider"]), Messages.sendMessage);
// AI
exports.api.get("/ai/suggest", AI.suggest);
// Payments
exports.api.post("/payments/esewa/initiate", (0, auth_js_1.requireAuth)(["user"]), Payments.esewaInitiate);
exports.api.post("/payments/khalti/initiate", (0, auth_js_1.requireAuth)(["user"]), Payments.khaltiInitiate);
// Provider Location API
exports.api.post("/provider/location", (0, auth_js_1.requireAuth)(["provider"]), Tracking.updateProviderLocation);
exports.api.post("/provider/status", (0, auth_js_1.requireAuth)(["provider"]), Tracking.updateProviderStatus);
// Admin routes
exports.api.use("/admin", Admin.adminRouter);
// Admin test-only endpoints (protected by header X-Seed-Key)
exports.api.post("/admin/seed", async (req, res) => {
    var _a;
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEEDING !== "true") {
        return res.status(403).json({ message: "disabled_in_production" });
    }
    const key = req.header("X-Seed-Key");
    if (key !== ((_a = process.env.SEED_KEY) !== null && _a !== void 0 ? _a : "dev-seed-key"))
        return res.status(403).json({ message: "forbidden" });
    const { UserModel } = await Promise.resolve().then(() => __importStar(require("../models/User.js")));
    const { ServiceModel } = await Promise.resolve().then(() => __importStar(require("../models/Service.js")));
    const bcrypt = (await Promise.resolve().then(() => __importStar(require("bcrypt")))).default;
    const upsertUser = async (doc) => {
        var _a;
        const existing = await UserModel.findOne({ email: doc.email });
        if (existing)
            return existing;
        const passwordHash = await bcrypt.hash((_a = doc.password) !== null && _a !== void 0 ? _a : "password123", 12);
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
    const service = existingService !== null && existingService !== void 0 ? existingService : (await ServiceModel.create({
        title: "Basic Plumbing",
        description: "Fix leaks and clogs",
        basePrice: 1500,
        images: [],
        location: "Kathmandu",
        providerId: provider._id,
    }));
    res.json({ ok: true, userId: user._id, providerId: provider._id, serviceId: service._id });
});
exports.api.post("/admin/make-provider", async (req, res) => {
    var _a;
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEEDING !== "true") {
        return res.status(403).json({ message: "disabled_in_production" });
    }
    const key = req.header("X-Seed-Key");
    if (key !== ((_a = process.env.SEED_KEY) !== null && _a !== void 0 ? _a : "dev-seed-key"))
        return res.status(403).json({ message: "forbidden" });
    const { userId } = req.query;
    if (!userId)
        return res.status(400).json({ message: "userId required" });
    const { UserModel } = await Promise.resolve().then(() => __importStar(require("../models/User.js")));
    await UserModel.updateOne({ _id: userId }, { $set: { role: "provider" } });
    res.json({ ok: true });
});
// Meta
exports.api.get("/meta/categories", Meta.listCategories);
exports.api.get("/categories", Meta.listCategories);
// Tracking
exports.api.post("/tracking/location", (0, auth_js_1.requireAuth)(["provider"]), Tracking.updateProviderLocation);
exports.api.post("/tracking/status", (0, auth_js_1.requireAuth)(["provider"]), Tracking.updateProviderStatus);
exports.api.get("/tracking/:bookingId", (0, auth_js_1.requireAuth)(["user", "provider"]), Tracking.getTrackingInfo);
exports.api.get("/tracking/:bookingId/eta", (0, auth_js_1.requireAuth)(["user", "provider"]), Tracking.getETA);
// File Upload
exports.api.use("/upload", upload_js_1.default);
