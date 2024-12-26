import { z } from 'zod';

import { APP_VERSION_STATUS } from 'consts/app-versions';
import { baseResponseHttpMetaDataSchema } from 'services/schemas/api-service-schemas';

export const promoteAppSchema = z
  .object({
    status: z.nativeEnum(APP_VERSION_STATUS),
  })
  .merge(baseResponseHttpMetaDataSchema);
