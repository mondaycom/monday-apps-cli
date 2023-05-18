import { z } from 'zod';

import { clientChannelSchema } from 'services/schemas/notification-schema';

export type ClientChannel = z.infer<typeof clientChannelSchema>;
