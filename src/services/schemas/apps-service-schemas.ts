import { z } from 'zod';

import { baseResponseHttpMetaDataSchema } from 'services/schemas/api-service-schemas';
import { appIdSchema } from 'services/schemas/general-schemas';

export const appSchema = z.object({
  id: appIdSchema,
  name: z.string(),
});

export const listAppSchema = z
  .object({
    apps: z.array(appSchema),
  })
  .merge(baseResponseHttpMetaDataSchema);
