import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';
import { Comment } from '../models/Comment';

export const requireCommentOwnerOrAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHENTICATED', 'User not authenticated', 401);
      return;
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      sendError(res, 'NOT_FOUND', 'Comment not found', 404);
      return;
    }

    if (comment.author.toString() !== req.user.id) {
      sendError(res, 'FORBIDDEN', 'You do not have permission to modify this comment', 403);
      return;
    }

    next();
  } catch (error) {
    sendError(res, 'SERVER_ERROR', 'Failed to authorize comment owner', 500);
  }
};
