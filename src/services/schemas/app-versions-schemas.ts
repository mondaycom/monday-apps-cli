import { z } from 'zod';

import { APP_VERSION_STATUS } from 'consts/app-versions';
import { baseResponseHttpMetaDataSchema } from 'services/schemas/api-service-schemas';
import { mondayCodeConfigSchema } from 'services/schemas/apps-service-schemas';
import { appIdSchema, appVersionIdSchema } from 'services/schemas/general-schemas';

export const appVersionSchema = z.object({
  id: appVersionIdSchema,
  name: z.string(),
  versionNumber: z.string(),
  appId: appIdSchema,
  status: z.nativeEnum(APP_VERSION_STATUS),
  mondayCodeConfig: mondayCodeConfigSchema,
});

export const listAppVersionsSchema = z
  .object({
    appVersions: z.array(appVersionSchema),
  })
  .merge(baseResponseHttpMetaDataSchema);

export const getAppVersionSchema = z
  .object({
    appVersion: appVersionSchema,
  })
  .merge(baseResponseHttpMetaDataSchema);
