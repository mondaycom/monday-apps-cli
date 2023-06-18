import { z } from 'zod';

import { appVersionSchema, listAppVersionsSchema } from 'services/schemas/app-versions-schemas';

export type AppVersion = z.infer<typeof appVersionSchema>;
export type ListAppVersionsResponse = z.infer<typeof listAppVersionsSchema>;
