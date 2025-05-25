import { z } from 'zod';

import { databaseConnectionStringResponseSchema } from 'services/schemas/database-service-schemas';

export type DatabaseConnectionStringResponseSchema = z.infer<typeof databaseConnectionStringResponseSchema>;
