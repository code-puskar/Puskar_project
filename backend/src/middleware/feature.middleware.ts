import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';
import { FeatureRequest } from '../models/FeatureRequest';

export const requireFeatureOwnerOrAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHENTICATED', 'User not authenticated', 401);
      return;
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const { id } = req.params;
    const feature = await FeatureRequest.findById(id);

    if (!feature) {
      sendError(res, 'NOT_FOUND', 'Feature request not found', 404);
      return;
    }

    if (feature.author.toString() !== req.user.id) {
      sendError(res, 'FORBIDDEN', 'You do not have permission to modify this feature request', 403);
      return;
    }

    next();
  } catch (error) {
    sendError(res, 'SERVER_ERROR', 'Failed to authorize feature owner', 500);
  }
};
