import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireFeatureOwnerOrAdmin } from '../../middleware/feature.middleware';
import voteRoutes from '../votes/vote.routes';
import featureCommentRoutes from '../comments/feature-comment.routes';
import * as featureController from './feature.controller';

const router = Router();

// Public routes (with optional auth for hasVoted tracking)
router.get('/', featureController.getFeatures);
router.get('/:id', featureController.getFeatureById);

// Protected routes
router.post('/', requireAuth, featureController.createFeature);
router.patch('/:id', requireAuth, requireFeatureOwnerOrAdmin, featureController.updateFeature);
router.delete('/:id', requireAuth, requireFeatureOwnerOrAdmin, featureController.deleteFeature);

router.use('/:id/vote', voteRoutes);
router.use('/:id/comments', featureCommentRoutes);

export default router;
