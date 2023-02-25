import { z } from 'zod';
import { clientChannelSchema } from '../../services/schemas/stats-schema';

export type ClientChannel = z.infer<typeof clientChannelSchema>;
