import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/apiResponse';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      sendError(res, 'UNAUTHENTICATED', 'No access token provided', 401);
      return;
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    sendError(res, 'UNAUTHENTICATED', 'Invalid or expired access token', 401);
  }
};

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    sendError(res, 'FORBIDDEN', 'Requires admin privileges', 403);
  }
};
