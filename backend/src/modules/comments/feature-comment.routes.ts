import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as commentController from './comment.controller';

const router = Router({ mergeParams: true });

router.get('/', commentController.getCommentsForFeature);
router.post('/', requireAuth, commentController.createComment);

export default router;
