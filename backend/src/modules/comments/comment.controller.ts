import { Request, Response } from 'express';
import { Comment } from '../../models/Comment';
import { FeatureRequest } from '../../models/FeatureRequest';
import { createCommentSchema, updateCommentSchema } from './comment.validation';
import { sendSuccess, sendError } from '../../utils/apiResponse';

export const getCommentsForFeature = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // feature ID
    const comments = await Comment.find({ featureRequest: id })
      .populate('author', 'name')
      .sort({ createdAt: 1 })
      .lean();

    // The frontend can build the tree structure from this flat array
    sendSuccess(res, { items: comments });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // feature ID
    if (!req.user) {
      sendError(res, 'UNAUTHENTICATED', 'Not authenticated', 401);
      return;
    }

    const parsed = createCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 'VALIDATION_ERROR', 'Invalid request data', 422, parsed.error.format());
      return;
    }

    const feature = await FeatureRequest.findById(id);
    if (!feature) {
      sendError(res, 'NOT_FOUND', 'Feature request not found', 404);
      return;
    }

    let parentCommentId = null;
    if (parsed.data.parentComment) {
      const parent = await Comment.findById(parsed.data.parentComment);
      if (!parent || parent.featureRequest.toString() !== id) {
        sendError(res, 'BAD_REQUEST', 'Invalid parent comment', 400);
        return;
      }
      parentCommentId = parent._id;
    }

    const newComment = await Comment.create({
      featureRequest: id,
      author: req.user.id,
      bodyMarkdown: parsed.data.bodyMarkdown,
      parentComment: parentCommentId,
    });

    // Safely increment commentCount
    await FeatureRequest.findByIdAndUpdate(id, { $inc: { commentCount: 1 } });

    await newComment.populate('author', 'name');

    sendSuccess(res, newComment, 201);
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parsed = updateCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 'VALIDATION_ERROR', 'Invalid request data', 422, parsed.error.format());
      return;
    }

    const comment = await Comment.findByIdAndUpdate(
      id,
      { $set: { bodyMarkdown: parsed.data.bodyMarkdown } },
      { new: true }
    ).populate('author', 'name');

    if (!comment) {
      sendError(res, 'NOT_FOUND', 'Comment not found', 404);
      return;
    }

    sendSuccess(res, comment);
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Soft delete preserves threading
    const comment = await Comment.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true, bodyMarkdown: 'This comment has been deleted.' } },
      { new: true }
    );

    if (!comment) {
      sendError(res, 'NOT_FOUND', 'Comment not found or already deleted', 404);
      return;
    }

    // Safely decrement commentCount (cannot drop below zero)
    await FeatureRequest.updateOne(
      { _id: comment.featureRequest, commentCount: { $gt: 0 } },
      { $inc: { commentCount: -1 } }
    );

    sendSuccess(res, { message: 'Comment deleted successfully' });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};
