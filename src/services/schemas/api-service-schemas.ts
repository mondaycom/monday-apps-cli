import { z } from 'zod';

export const baseResponseHttpMetaDataSchema = z.object({
  data: z.any().optional(),
  statusCode: z.number(),
  headers: z.record(z.string(), z.array(z.string()).or(z.string())),
});

export const baseErrorResponseSchema = z.object({
  title: z.string().optional(),
  message: z.string().optional(),
  traceId: z.string().optional(),
});
