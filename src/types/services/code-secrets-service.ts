import { z } from 'zod';

import { listAppSecretsResponseSchema } from 'services/schemas/code-secrets-service-schemas';

export type ListAppSecretsResponse = z.infer<typeof listAppSecretsResponseSchema>;
