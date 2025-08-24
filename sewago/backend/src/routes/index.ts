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
import * as Wallet from "../controllers/wallet.controller.js";
import * as KYC from "../controllers/kyc.controller.js";
import * as Notifications from "../controllers/notifications.controller.js";
import * as Referral from "../controllers/referral.controller.js";
import * as Community from "../controllers/community.controller.js";
import * as AIFeatures from "../controllers/ai-features.controller.js";
import * as QualityControl from "../controllers/quality-control.controller.js";
import Admin from "./admin.js";
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
api.post("/bookings/:id/reschedule", requireAuth(["user", "provider"]), Bookings.rescheduleBooking);

// Reviews
api.post("/reviews", requireAuth(["user"]), Reviews.addReview);
api.get("/reviews/provider/:providerId", Reviews.listProviderReviews);
api.get("/reviews/pending-moderation", requireAuth(["admin"]), Reviews.getPendingModeration);

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

// Enhanced Wallet & Payment System (P0)
api.get("/wallet", requireAuth(["user", "provider"]), Wallet.getUserWallet);
api.post("/wallet/topup", requireAuth(["user", "provider"]), Wallet.topUpWallet);
api.post("/wallet/refund", requireAuth(["user", "provider"]), Wallet.refundWallet);
api.get("/wallet/transactions", requireAuth(["user", "provider"]), Wallet.getTransactionHistory);
api.get("/wallet/export", requireAuth(["user", "provider"]), Wallet.exportTransactions);
api.post("/wallet/setup-bnpl", requireAuth(["user", "provider"]), Wallet.setupBNPL);
api.post("/wallet/payout-request", requireAuth(["provider"]), Wallet.requestPayout);
api.get("/wallet/payout-history", requireAuth(["provider"]), Wallet.getPayoutHistory);

// Legacy wallet endpoints for backward compatibility
api.post("/wallet/add-funds", requireAuth(["user", "provider"]), Wallet.addFunds);
api.post("/wallet/use", requireAuth(["user", "provider"]), Wallet.useWallet);
api.post("/wallet/auto-recharge", requireAuth(["user", "provider"]), Wallet.setupAutoRecharge);

// KYC & Provider Verification (P0)
api.post("/kyc/submit", requireAuth(["provider"]), KYC.submitKYC);
api.get("/kyc/status", requireAuth(["provider"]), KYC.getKYCStatus);
api.patch("/kyc/update", requireAuth(["provider"]), KYC.updateKYC);
api.post("/kyc/documents", requireAuth(["provider"]), KYC.addKYCDocument);
api.delete("/kyc/documents/:documentType", requireAuth(["provider"]), KYC.removeKYCDocument);

// Admin KYC Management
api.get("/admin/kyc/pending", requireAuth(["admin"]), KYC.getPendingKYC);
api.post("/admin/kyc/:providerId/approve", requireAuth(["admin"]), KYC.approveKYC);
api.post("/admin/kyc/:providerId/reject", requireAuth(["admin"]), KYC.rejectKYC);

// Provider Availability & Scheduling (P0)
api.get("/providers/:id/slots", requireAuth(["user", "provider"]), Bookings.getProviderSlots);
api.post("/providers/:id/slots/lock", requireAuth(["user"]), Bookings.lockProviderSlot);
api.post("/providers/:id/slots/unlock", requireAuth(["user"]), Bookings.unlockProviderSlot);

// Enhanced Notifications System (P0)
api.get("/notifications", requireAuth(["user", "provider", "admin"]), Notifications.getUserNotifications);
api.patch("/notifications/:notificationId/read", requireAuth(["user", "provider", "admin"]), Notifications.markNotificationAsRead);
api.patch("/notifications/read-all", requireAuth(["user", "provider", "admin"]), Notifications.markAllNotificationsAsRead);
api.patch("/notifications/:notificationId/click", requireAuth(["user", "provider", "admin"]), Notifications.markNotificationAsClicked);
api.patch("/notifications/:notificationId/dismiss", requireAuth(["user", "provider", "admin"]), Notifications.dismissNotification);
api.get("/notifications/preferences", requireAuth(["user", "provider", "admin"]), Notifications.getNotificationPreferences);
api.patch("/notifications/preferences", requireAuth(["user", "provider", "admin"]), Notifications.updateNotificationPreferences);
api.post("/notifications/test", requireAuth(["user", "provider", "admin"]), Notifications.sendTestNotification);
api.get("/notifications/stats", requireAuth(["user", "provider", "admin"]), Notifications.getNotificationStats);
api.get("/admin/notifications/stats", requireAuth(["admin"]), Notifications.getSystemNotificationStats);

// Referral & Social Network
api.post("/referral/generate", requireAuth(["user", "provider"]), Referral.generateReferralCode);
api.post("/referral/use", requireAuth(["user", "provider"]), Referral.useReferralCode);
api.get("/referral/stats", requireAuth(["user", "provider"]), Referral.getReferralStats);
api.post("/referral/social-circle", requireAuth(["user", "provider"]), Referral.createSocialCircle);
api.post("/referral/join-circle", requireAuth(["user", "provider"]), Referral.joinSocialCircle);
api.post("/referral/split-payment", requireAuth(["user", "provider"]), Referral.setupSplitPayment);
api.get("/referral/social-circles", requireAuth(["user", "provider"]), Referral.getSocialCircles);

// Community Features
api.post("/community/stories", requireAuth(["user", "provider"]), Community.createUserStory);
api.get("/community/stories", Community.getUserStories);
api.post("/community/stories/:storyId/like", requireAuth(["user", "provider"]), Community.toggleStoryLike);
api.post("/community/stories/:storyId/comments", requireAuth(["user", "provider"]), Community.addStoryComment);
api.post("/community/spotlights", requireAuth(["provider"]), Community.createProviderSpotlight);
api.get("/community/spotlights", Community.getProviderSpotlights);
api.get("/community/social-proof", Community.getSocialProof);
api.post("/community/events", requireAuth(["user", "provider"]), Community.createEvent);
api.post("/community/events/:eventId/join", requireAuth(["user", "provider"]), Community.joinEvent);

// AI Features & Smart Technical Features
api.get("/ai/search-predictions", AIFeatures.getSearchPredictions);
api.post("/ai/voice-booking", requireAuth(["user", "provider"]), AIFeatures.processVoiceBooking);
api.post("/ai/scheduling-recommendations", requireAuth(["user", "provider"]), AIFeatures.getSchedulingRecommendations);
api.get("/ai/pricing-suggestions/:serviceId", AIFeatures.getPricingSuggestions);
api.post("/ai/user-behavior", requireAuth(["user", "provider"]), AIFeatures.updateUserBehavior);

// Quality Control System
api.get("/quality/guarantees", QualityControl.getServiceGuarantees);
api.get("/quality/guarantees/:serviceId", QualityControl.getServiceGuarantees);
api.post("/quality/guarantees", requireAuth(["admin"]), QualityControl.createServiceGuarantee);
api.get("/quality/metrics", QualityControl.getQualityMetrics);
api.get("/quality/provider-scores", QualityControl.getProviderQualityScores);
api.get("/quality/provider-scores/:providerId", QualityControl.getProviderQualityScores);
api.post("/quality/incidents", requireAuth(["user", "provider"]), QualityControl.reportQualityIncident);
api.patch("/quality/incidents/:incidentId/resolve", requireAuth(["admin"]), QualityControl.resolveQualityIncident);
api.get("/quality/assurance-settings", QualityControl.getQualityAssuranceSettings);
api.put("/quality/assurance-settings", requireAuth(["admin"]), QualityControl.updateQualityAssuranceSettings);
api.get("/quality/feedback-analysis", QualityControl.getFeedbackAnalysis);

// File uploads
api.use("/upload", uploadRouter);

// Admin routes
api.use("/admin", Admin);

export default api;


