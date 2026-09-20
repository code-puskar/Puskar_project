import { Router } from 'express';
import * as adminController from './admin.controller';
import { requireAuth, authorizeAdmin } from '../../middleware/auth.middleware';

const router = Router();

// Protect all admin routes
router.use(requireAuth, authorizeAdmin);

// Get analytics
router.get('/stats', adminController.getAnalytics);

// Update a feature's status
router.patch('/features/:id/status', adminController.updateFeatureStatus);

// Soft delete or restore a comment
router.patch('/comments/:id/moderate', adminController.moderateComment);

export default router;
