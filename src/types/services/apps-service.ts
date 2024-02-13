import { z } from 'zod';

import { appSchema, createAppSchema, listAppSchema } from 'services/schemas/apps-service-schemas';

export type App = z.infer<typeof appSchema>;
export type ListAppResponse = z.infer<typeof listAppSchema>;
export type CreateAppResponse = z.infer<typeof createAppSchema>;
