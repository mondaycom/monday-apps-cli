import { z } from 'zod';

import { baseResponseHttpMetaDataSchema } from 'services/schemas/api-service-schemas';

export const clientChannelSchema = z
  .object({
    channelName: z.string(),
    channelEvents: z.array(z.string()),
    cluster: z.string(),
    credentials: z.object({ key: z.string() }),
    ttl: z.number(),
  })
  .merge(baseResponseHttpMetaDataSchema);
