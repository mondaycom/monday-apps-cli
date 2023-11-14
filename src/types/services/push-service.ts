import { z } from 'zod';

import {
  appVersionDeploymentStatusSchema,
  deploymentStatusTypesSchema,
  signedUrlSchema,
  tunnelAuthTokenSchema,
} from 'services/schemas/push-service-schemas';

export type SignedUrl = z.infer<typeof signedUrlSchema>;

export type AppVersionDeploymentStatus = z.infer<typeof appVersionDeploymentStatusSchema>;

export type TunnelAuthToken = z.infer<typeof tunnelAuthTokenSchema>;

export const DeploymentStatusTypesSchema = deploymentStatusTypesSchema.enum;
