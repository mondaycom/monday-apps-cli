import { z } from 'zod';

import { baseResponseHttpMetaDataSchema } from 'services/schemas/api-service-schemas';

export const listAppSecretKeysResponseSchema = z
  .object({
    keys: z.array(z.string()),
  })
  .merge(baseResponseHttpMetaDataSchema);
