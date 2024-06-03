import { z } from 'zod';

import { appVersionSchema, getAppVersionSchema, listAppVersionsSchema } from 'services/schemas/app-versions-schemas';

export type AppVersion = z.infer<typeof appVersionSchema>;
export type GetAppVersionResponse = z.infer<typeof getAppVersionSchema>;
export type ListAppVersionsResponse = z.infer<typeof listAppVersionsSchema>;
