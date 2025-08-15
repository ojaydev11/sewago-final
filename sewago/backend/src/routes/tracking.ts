import { Router } from 'express';
import { updateProviderLocation, updateProviderStatus, getTrackingInfo, getETA } from '../controllers/tracking.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Update provider location (requires provider authentication)
router.post('/location', authMiddleware, updateProviderLocation);

// Update provider status (requires provider authentication)
router.post('/status', authMiddleware, updateProviderStatus);

// Get tracking information for a booking (requires authentication)
router.get('/:bookingId', authMiddleware, getTrackingInfo);

// Get ETA for a booking (requires authentication)
router.get('/:bookingId/eta', authMiddleware, getETA);

export default router;
