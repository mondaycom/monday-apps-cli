import { z } from 'zod';

import { listAppSecretKeysResponseSchema } from 'services/schemas/manage-app-secret-service-schemas';

export type ListAppSecretKeysResponse = z.infer<typeof listAppSecretKeysResponseSchema>;
