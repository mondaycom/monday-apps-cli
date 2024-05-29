import { z } from 'zod';

import { appVersionSchema, appVersionsSchema, listAppVersionsSchema } from 'services/schemas/app-versions-schemas';

export type AppVersion = z.infer<typeof appVersionSchema>;
export type Version = z.infer<typeof appVersionsSchema>;
export type ListAppVersionsResponse = z.infer<typeof listAppVersionsSchema>;
