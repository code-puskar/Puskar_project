import { Request, Response } from 'express';
import { FeatureRequest } from '../../models/FeatureRequest';
import { Comment } from '../../models/Comment';
import { sendSuccess, sendError } from '../../utils/apiResponse';

export const updateFeatureStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['under_review', 'planned', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      sendError(res, 'BAD_REQUEST', 'Invalid status', 400);
      return;
    }

    const feature = await FeatureRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!feature) {
      sendError(res, 'NOT_FOUND', 'Feature not found', 404);
      return;
    }

    sendSuccess(res, { feature });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const moderateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isDeleted } = req.body;

    // Use soft delete
    const comment = await Comment.findByIdAndUpdate(
      id,
      { isDeleted: !!isDeleted },
      { new: true }
    );

    if (!comment) {
      sendError(res, 'NOT_FOUND', 'Comment not found', 404);
      return;
    }

    sendSuccess(res, { comment });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const [statusStats, categoryStats, topUsers] = await Promise.all([
      FeatureRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      FeatureRequest.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      FeatureRequest.aggregate([
        { $group: { _id: '$author', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        { $project: { name: '$user.name', email: '$user.email', count: 1 } }
      ])
    ]);

    const formattedStatus = statusStats.map(s => ({ name: s._id, value: s.count }));
    const formattedCategory = categoryStats.map(c => ({ name: c._id, value: c.count }));

    sendSuccess(res, {
      statusStats: formattedStatus,
      categoryStats: formattedCategory,
      topUsers
    });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};
