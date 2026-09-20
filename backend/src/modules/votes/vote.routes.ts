import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as voteController from './vote.controller';

// mergeParams is required to access the :id parameter from the parent feature router
const router = Router({ mergeParams: true });

router.post('/', requireAuth, voteController.upvote);
router.delete('/', requireAuth, voteController.removeVote);

export default router;
