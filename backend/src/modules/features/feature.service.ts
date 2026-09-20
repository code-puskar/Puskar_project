import { FeatureRequest } from '../../models/FeatureRequest';
import mongoose from 'mongoose';

export class FeatureService {
  static async getFeatures(query: any, currentUserId?: string) {
    const { page = 1, limit = 10, sort = 'trending', category, status, search } = query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      filter.$text = { $search: search as string };
    }

    let sortObj: any = {};
    if (sort === 'trending') sortObj = { voteCount: -1, createdAt: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };
    else if (sort === 'most_discussed') sortObj = { commentCount: -1, createdAt: -1 };
    else sortObj = { voteCount: -1, createdAt: -1 }; // fallback

    // If searching, sorting by text score might be preferable, but sticking to requested sorts.
    
    const [items, totalItems] = await Promise.all([
      FeatureRequest.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('author', 'name')
        .lean(),
      FeatureRequest.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    // Inject hasVoted
    const mappedItems = items.map((item: any) => {
      const hasVoted = currentUserId
        ? item.voterIds.some((vId: mongoose.Types.ObjectId) => vId.toString() === currentUserId)
        : false;
      
      const { voterIds, ...rest } = item; // Omit voterIds array for payload size & security
      return { ...rest, hasVoted };
    });

    return {
      items: mappedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
    };
  }

  static async getFeatureById(id: string, currentUserId?: string) {
    const feature: any = await FeatureRequest.findById(id).populate('author', 'name').lean();
    if (!feature) return null;

    const hasVoted = currentUserId
      ? feature.voterIds.some((vId: mongoose.Types.ObjectId) => vId.toString() === currentUserId)
      : false;

    const { voterIds, ...rest } = feature;
    return { ...rest, hasVoted };
  }

  static async createFeature(data: any, authorId: string) {
    return FeatureRequest.create({
      ...data,
      author: authorId,
      status: 'under_review',
      voteCount: 0,
      commentCount: 0,
    });
  }

  static async updateFeature(id: string, data: any) {
    // Standard users can only modify these 3 fields. The controller filters input.
    return FeatureRequest.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
  }

  static async deleteFeature(id: string) {
    return FeatureRequest.findByIdAndDelete(id);
  }
}
