import { Request, Response } from 'express';
import { FeatureRequest } from '../../models/FeatureRequest';
import { sendSuccess, sendError } from '../../utils/apiResponse';

export const upvote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!req.user) {
      sendError(res, 'UNAUTHENTICATED', 'Not authenticated', 401);
      return;
    }

    const userId = req.user.id;

    // Atomic update: only update if user hasn't voted yet
    const result = await FeatureRequest.updateOne(
      {
        _id: id,
        voterIds: { $ne: userId }
      },
      {
        $addToSet: { voterIds: userId },
        $inc: { voteCount: 1 }
      }
    );

    // Fetch the updated document to return the exact new count
    const updatedFeature = await FeatureRequest.findById(id).select('voteCount voterIds').lean();
    if (!updatedFeature) {
      sendError(res, 'NOT_FOUND', 'Feature request not found', 404);
      return;
    }

    const hasVoted = true;

    sendSuccess(res, {
      voteCount: updatedFeature.voteCount,
      hasVoted,
      modified: result.modifiedCount > 0
    });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const removeVote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      sendError(res, 'UNAUTHENTICATED', 'Not authenticated', 401);
      return;
    }

    const userId = req.user.id;

    // Atomic update: only update if user HAS voted and count > 0
    const result = await FeatureRequest.updateOne(
      {
        _id: id,
        voterIds: userId,
        voteCount: { $gt: 0 }
      },
      {
        $pull: { voterIds: userId },
        $inc: { voteCount: -1 }
      }
    );

    // Fetch the updated document
    const updatedFeature = await FeatureRequest.findById(id).select('voteCount voterIds').lean();
    if (!updatedFeature) {
      sendError(res, 'NOT_FOUND', 'Feature request not found', 404);
      return;
    }

    const hasVoted = false;

    sendSuccess(res, {
      voteCount: updatedFeature.voteCount,
      hasVoted,
      modified: result.modifiedCount > 0
    });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};
