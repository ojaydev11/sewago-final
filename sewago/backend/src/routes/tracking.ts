import { Router } from 'express';
import { TrackingController } from '../controllers/tracking.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Update provider location (requires provider authentication)
router.post('/location', authMiddleware, TrackingController.updateProviderLocation);

// Update provider status (requires provider authentication)
router.post('/status', authMiddleware, TrackingController.updateProviderStatus);

// Get tracking information for a booking (requires authentication)
router.get('/:bookingId', authMiddleware, TrackingController.getTrackingInfo);

// Get ETA for a booking (requires authentication)
router.get('/:bookingId/eta', authMiddleware, TrackingController.getETA);

export default router;
