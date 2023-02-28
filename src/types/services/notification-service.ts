import { z } from 'zod';
import { clientChannelSchema } from '../../services/schemas/notification-schema.js';

export type ClientChannel = z.infer<typeof clientChannelSchema>;
