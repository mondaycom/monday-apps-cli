import { z } from 'zod';

import { baseResponseHttpMetaDataSchema } from 'services/schemas/api-service-schemas';

export const docsDbConnectionStringResponseSchema = z
  .object({
    connectionString: z.string(),
  })
  .merge(baseResponseHttpMetaDataSchema);
