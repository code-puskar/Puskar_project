import { Request, Response } from 'express';
import { FeatureRequest } from '../../models/FeatureRequest';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { verifyAccessToken } from '../../utils/jwt';

export const getRoadmap = async (req: Request, res: Response): Promise<void> => {
  try {
    let currentUserId: string | undefined;
    const token = req.cookies?.accessToken;
    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        currentUserId = decoded.id;
      } catch (e) {
        // ignore
      }
    }

    // Only fetch features that are actively on the roadmap (exclude under_review)
    const features = await FeatureRequest.find({
      status: { $in: ['planned', 'in_progress', 'completed'] }
    })
      .populate('author', 'name')
      .sort({ voteCount: -1, createdAt: -1 })
      .lean();

    const planned: any[] = [];
    const inProgress: any[] = [];
    const completed: any[] = [];

    features.forEach((feature: any) => {
      const hasVoted = currentUserId
        ? feature.voterIds.some((vId: any) => vId.toString() === currentUserId)
        : false;
      
      const { voterIds, ...rest } = feature;
      const formatted = { ...rest, hasVoted };

      if (feature.status === 'planned') planned.push(formatted);
      else if (feature.status === 'in_progress') inProgress.push(formatted);
      else if (feature.status === 'completed') completed.push(formatted);
    });

    sendSuccess(res, { planned, inProgress, completed });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};
