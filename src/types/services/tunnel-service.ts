import { z } from 'zod';

import { tunnelAuthTokenSchema } from 'services/schemas/push-service-schemas';

export type TunnelAuthToken = z.infer<typeof tunnelAuthTokenSchema>;
