import { Router } from 'express';
import * as usersController from './users.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/me/features', usersController.getMyFeatures);
router.get('/me/comments', usersController.getMyComments);

export default router;
