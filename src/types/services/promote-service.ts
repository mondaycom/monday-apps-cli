import { z } from 'zod';

import { promoteAppSchema } from 'services/schemas/promote-schema';

export type PromoteStatusResponse = z.infer<typeof promoteAppSchema>;
