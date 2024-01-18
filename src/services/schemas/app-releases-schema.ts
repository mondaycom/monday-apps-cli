import { z } from 'zod';

import { AppReleaseCategory } from 'consts/app-release';
import { baseResponseHttpMetaDataSchema } from 'services/schemas/api-service-schemas';
import { appReleaseIdSchema, appVersionIdSchema } from 'services/schemas/general-schemas';

export const appReleaseSchema = z.object({
  id: appReleaseIdSchema,
  // eslint-disable-next-line camelcase
  app_version_id: appVersionIdSchema,
  kind: z.string(),
  category: z.nativeEnum(AppReleaseCategory),
  state: z.string(),
  data: z
    .object({
      url: z.string().optional(),
      latestUrl: z.string().optional(),
      liveUrl: z.string().optional(),
      deploymentState: z.string().optional(),
      sourceUrl: z.string().optional(),
      microFrontendName: z.string().optional(),
    })
    .optional(),
});

export const appReleasesSchema = z
  .object({
    appReleases: z.array(appReleaseSchema),
  })
  .merge(baseResponseHttpMetaDataSchema);

export type AppReleasesResponse = z.infer<typeof appReleasesSchema>;
export type AppRelease = z.infer<typeof appReleaseSchema>;
