import { z } from 'zod';

import { listAppEnvironmentKeysResponseSchema } from 'services/schemas/manage-app-env-service-schemas';

export type ListAppEnvironmentKeysResponse = z.infer<typeof listAppEnvironmentKeysResponseSchema>;
