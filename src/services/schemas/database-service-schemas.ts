import { z } from 'zod';

import { baseResponseHttpMetaDataSchema } from 'services/schemas/api-service-schemas';

export const databaseConnectionStringResponseSchema = z
  .object({
    connectionString: z.string(),
    expiresAt: z.string(),
  })
  .merge(baseResponseHttpMetaDataSchema);
