import { Router } from 'express';
import * as roadmapController from './roadmap.controller';

const router = Router();

// Public route to view the roadmap
router.get('/', roadmapController.getRoadmap);

export default router;
