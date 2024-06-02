import { z } from 'zod';

import { appVersionHttpSchema, appVersionSchema, listAppVersionsSchema } from 'services/schemas/app-versions-schemas';

export type AppVersion = z.infer<typeof appVersionSchema>;
export type Version = z.infer<typeof appVersionHttpSchema>;
export type ListAppVersionsResponse = z.infer<typeof listAppVersionsSchema>;
