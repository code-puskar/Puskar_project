import { Request, Response, NextFunction } from 'express';
import { FeatureService } from './feature.service';
import { createFeatureSchema, updateFeatureSchema } from './feature.validation';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { verifyAccessToken } from '../../utils/jwt';

// Helper to optionally extract user ID without enforcing authentication
const getOptionalUserId = (req: Request): string | undefined => {
  const token = req.cookies?.accessToken;
  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      return decoded.id;
    } catch (e) {
      return undefined;
    }
  }
  return undefined;
};

export const getFeatures = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = getOptionalUserId(req);
    const result = await FeatureService.getFeatures(req.query, currentUserId);
    sendSuccess(res, result);
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const getFeatureById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = getOptionalUserId(req);
    const feature = await FeatureService.getFeatureById(id, currentUserId);

    if (!feature) {
      sendError(res, 'NOT_FOUND', 'Feature request not found', 404);
      return;
    }

    sendSuccess(res, feature);
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const createFeature = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createFeatureSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 'VALIDATION_ERROR', 'Invalid request data', 422, parsed.error.format());
      return;
    }

    if (!req.user) {
      sendError(res, 'UNAUTHENTICATED', 'Not authenticated', 401);
      return;
    }

    const newFeature = await FeatureService.createFeature(parsed.data, req.user.id);
    sendSuccess(res, newFeature, 201);
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const updateFeature = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parsed = updateFeatureSchema.safeParse(req.body);
    
    if (!parsed.success) {
      sendError(res, 'VALIDATION_ERROR', 'Invalid request data', 422, parsed.error.format());
      return;
    }

    // `requireFeatureOwnerOrAdmin` middleware guarantees authorization.
    const updated = await FeatureService.updateFeature(id, parsed.data);
    if (!updated) {
      sendError(res, 'NOT_FOUND', 'Feature request not found', 404);
      return;
    }

    sendSuccess(res, updated);
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const deleteFeature = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await FeatureService.deleteFeature(id);
    if (!deleted) {
      sendError(res, 'NOT_FOUND', 'Feature request not found', 404);
      return;
    }
    sendSuccess(res, { message: 'Feature request deleted successfully' });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};
