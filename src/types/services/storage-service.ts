import { z } from 'zod';

import { appStorageApiRecordsSearchResponseSchema } from 'services/schemas/storage-service-schemas';

export type AppStorageApiRecordsSearchResponseSchema = z.infer<typeof appStorageApiRecordsSearchResponseSchema>;
