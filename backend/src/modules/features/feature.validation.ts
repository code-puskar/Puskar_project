import { z } from 'zod';

export const createFeatureSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  descriptionMarkdown: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['UI/UX', 'Integrations', 'Performance', 'General']),
});

export const updateFeatureSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  descriptionMarkdown: z.string().min(10).optional(),
  category: z.enum(['UI/UX', 'Integrations', 'Performance', 'General']).optional(),
});
