import { z } from 'zod';

import { baseResponseHttpMetaDataSchema } from 'services/schemas/api-service-schemas';

export const appStorageApiRecordsResponseSchema = z.object({
  key: z.string(),
  value: z.string(),
  backendOnly: z.boolean(),
});

export const appStorageApiRecordsSearchResponseSchema = z
  .object({
    term: z.string(),
    records: z.array(appStorageApiRecordsResponseSchema),
    hasMoreRecords: z.boolean(),
  })
  .merge(baseResponseHttpMetaDataSchema);
