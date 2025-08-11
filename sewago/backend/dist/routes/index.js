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
export const api = Router();
// Health
api.get("/health", (_req, res) => res.json({ ok: true }));
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
// Meta
api.get("/meta/categories", Meta.listCategories);
api.get("/categories", Meta.listCategories);
