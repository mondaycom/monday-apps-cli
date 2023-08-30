import { z } from 'zod';

import { appIdSchema, appVersionIdSchema } from 'services/schemas/general-schemas';

export type AppId = z.infer<typeof appIdSchema>;
export type AppVersionId = z.infer<typeof appVersionIdSchema>;
