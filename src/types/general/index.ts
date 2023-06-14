import { z } from 'zod';

import { appIdSchema } from 'services/schemas/general-schemas';

export type AppId = z.infer<typeof appIdSchema>;
