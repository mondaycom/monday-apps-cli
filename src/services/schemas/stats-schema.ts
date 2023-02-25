import { z } from 'zod';
import { baseResponseHttpMetaDataSchema } from './monday-code-service-schemas.js';

export const clientChannelSchema = z
  .object({
    channelName: z.string(),
    cluster: z.string(),
    credentials: z.object({ key: z.string() }).optional(),
    ttl: z.number(),
  })
  .merge(baseResponseHttpMetaDataSchema);
