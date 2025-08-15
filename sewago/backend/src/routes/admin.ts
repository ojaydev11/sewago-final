import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as AdminBookings from "../controllers/admin/bookings.controller.js";
import * as AdminProviders from "../controllers/admin/providers.controller.js";
import * as AdminDashboard from "../controllers/admin/dashboard.controller.js";

export const adminRouter = Router();

// All admin routes require admin authentication
adminRouter.use(requireAuth(["admin"]));

// Dashboard
adminRouter.get("/dashboard", AdminDashboard.getDashboardStats);

// Booking Management
adminRouter.get("/bookings", AdminBookings.listBookings);
adminRouter.get("/bookings/:id", AdminBookings.getBooking);
adminRouter.put("/bookings/:id", AdminBookings.updateBooking);
adminRouter.put("/bookings/:id/assign-provider", AdminBookings.assignProvider);
adminRouter.put("/bookings/:id/status", AdminBookings.updateBookingStatus);

// Provider Management
adminRouter.get("/providers", AdminProviders.listProviders);
adminRouter.get("/providers/live", AdminProviders.getLiveProviders);
adminRouter.get("/providers/:id", AdminProviders.getProvider);
adminRouter.put("/providers/:id/verify", AdminProviders.verifyProvider);
adminRouter.put("/providers/:id/pause", AdminProviders.pauseProvider);
adminRouter.put("/providers/:id/activate", AdminProviders.activateProvider);

export default adminRouter;
