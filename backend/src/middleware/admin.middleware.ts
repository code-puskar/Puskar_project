import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    sendError(res, 'UNAUTHENTICATED', 'User not authenticated', 401);
    return;
  }

  if (req.user.role !== 'admin') {
    sendError(res, 'FORBIDDEN', 'Requires admin privileges', 403);
    return;
  }

  next();
};
