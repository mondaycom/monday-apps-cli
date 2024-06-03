import { z } from 'zod';

import { baseResponseHttpMetaDataSchema } from 'services/schemas/api-service-schemas';
import { appIdSchema } from 'services/schemas/general-schemas';

export const mondayCodeConfigSchema = z
  .object({
    isMultiRegion: z.boolean().optional(),
  })
  .optional();
export const appSchema = z.object({
  id: appIdSchema,
  name: z.string(),
  mondayCodeConfig: mondayCodeConfigSchema,
});

export const listAppSchema = z
  .object({
    apps: z.array(appSchema),
  })
  .merge(baseResponseHttpMetaDataSchema);

export const createAppSchema = z
  .object({
    app: appSchema,
  })
  .merge(baseResponseHttpMetaDataSchema);
