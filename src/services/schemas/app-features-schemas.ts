import { z } from 'zod';

import { baseResponseHttpMetaDataSchema } from 'services/schemas/api-service-schemas';

export const appFeatureSchema = z.object({
  id: z.number(),
  data: z.any().optional(),
  type: z.string(),
  name: z.string(),
  region: z.string().optional(),
  state: z.string().optional(),
  status: z.string().nullable().optional(),
  // eslint-disable-next-line camelcase
  current_release: z
    .object({
      data: z.object({ url: z.string() }).optional(),
    })
    .nullable()
    .optional(),
});

export const listAppFeaturesSchema = z
  .object({
    appFeatures: z.array(appFeatureSchema),
  })
  .merge(baseResponseHttpMetaDataSchema);

export const createAppFeatureReleaseSchema = z
  .object({
    // eslint-disable-next-line camelcase
    app_feature: appFeatureSchema,
  })
  .merge(baseResponseHttpMetaDataSchema);
