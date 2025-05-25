import { z } from 'zod';

import { docsDbConnectionStringResponseSchema } from 'services/schemas/docs-db-service-schemas';

export type DocsDbConnectionStringResponseSchema = z.infer<typeof docsDbConnectionStringResponseSchema>;
