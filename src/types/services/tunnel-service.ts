import { z } from 'zod';

import { tunnelAuthTokenSchema, tunnelDomainSchema } from 'services/schemas/push-service-schemas';

export type TunnelAuthToken = z.infer<typeof tunnelAuthTokenSchema>;

export type TunnelDomain = z.infer<typeof tunnelDomainSchema>;
