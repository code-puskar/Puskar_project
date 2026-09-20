import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireCommentOwnerOrAdmin } from '../../middleware/comment.middleware';
import * as commentController from './comment.controller';

const router = Router();

router.patch('/:id', requireAuth, requireCommentOwnerOrAdmin, commentController.updateComment);
router.delete('/:id', requireAuth, requireCommentOwnerOrAdmin, commentController.deleteComment);

export default router;
