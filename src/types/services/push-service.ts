import { z } from 'zod';

import {
  appVersionDeploymentStatusSchema,
  deploymentStatusTypesSchema,
  signedUrlSchema,
  uploadClientSchema,
} from 'services/schemas/push-service-schemas';

export type SignedUrl = z.infer<typeof signedUrlSchema>;

export type uploadClient = z.infer<typeof uploadClientSchema>;

export type AppVersionDeploymentStatus = z.infer<typeof appVersionDeploymentStatusSchema>;

export const DeploymentStatusTypesSchema = deploymentStatusTypesSchema.enum;
