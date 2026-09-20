import { Request, Response } from 'express';
import { FeatureRequest } from '../../models/FeatureRequest';
import { Comment } from '../../models/Comment';
import { sendSuccess, sendError } from '../../utils/apiResponse';

export const getMyFeatures = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401);
      return;
    }

    const features = await FeatureRequest.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'name')
      .lean();

    // Map to add hasVoted
    const mappedFeatures = features.map((item: any) => {
      const hasVoted = item.voterIds.some((vId: any) => vId.toString() === userId);
      const { voterIds, ...rest } = item;
      return { ...rest, hasVoted };
    });

    sendSuccess(res, { features: mappedFeatures });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const getMyComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401);
      return;
    }

    const comments = await Comment.find({ author: userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .populate('featureRequest', 'title status category')
      .populate('author', 'name')
      .lean();

    sendSuccess(res, { comments });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};
