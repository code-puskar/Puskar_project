import { z } from 'zod';

export const createCommentSchema = z.object({
  bodyMarkdown: z.string().min(1, 'Comment cannot be empty'),
  parentComment: z.string().nullable().optional(),
});

export const updateCommentSchema = z.object({
  bodyMarkdown: z.string().min(1, 'Comment cannot be empty'),
});
