import { z } from 'zod';

import {
  appStorageApiRecordsSearchResponseExportSchema,
  appStorageApiRecordsSearchResponseSearchSchema,
} from 'services/schemas/storage-service-schemas';

export type AppStorageApiRecordsSearchResponseSearchSchema = z.infer<
  typeof appStorageApiRecordsSearchResponseSearchSchema
>;
export type AppStorageApiRecordsSearchResponseExportSchema = z.infer<
  typeof appStorageApiRecordsSearchResponseExportSchema
>;
