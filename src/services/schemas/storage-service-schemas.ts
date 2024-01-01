import { z } from 'zod';

import { baseResponseHttpMetaDataSchema } from 'services/schemas/api-service-schemas';

export const appStorageApiRecordsResponseSchema = z.object({
  key: z.string(),
  value: z.string(),
  valueLength: z.number().optional(),
  backendOnly: z.boolean(),
});

export const appStorageApiRecordsSearchResponseSearchSchema = z
  .object({
    term: z.string(),
    records: z.array(appStorageApiRecordsResponseSchema),
    cursor: z.string().optional(),
  })
  .merge(baseResponseHttpMetaDataSchema);

export const appStorageApiRecordsSearchResponseExportSchema = z
  .object({
    records: z.array(appStorageApiRecordsResponseSchema),
  })
  .merge(baseResponseHttpMetaDataSchema);
