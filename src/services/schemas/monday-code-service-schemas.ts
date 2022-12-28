import { z } from 'zod';

export const baseResponseHttpMetaDataSchema = z.object({
  statusCode: z.number(),
  headers: z.record(z.string(), z.string()),
});

export const baseErrorResponseSchema = z.object({
  title: z.string().optional(),
  message: z.string().optional(),
});
