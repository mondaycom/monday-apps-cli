import { z } from 'zod';
import {
  appVersionDeploymentStatusSchema,
  deploymentStatusTypesSchema,
  signedUrlSchema,
} from '../../services/schemas/push-service-schemas.js';

export type SignedUrl = z.infer<typeof signedUrlSchema>;

export type AppVersionDeploymentStatus = z.infer<typeof appVersionDeploymentStatusSchema>;

export const DeploymentStatusTypesSchema = deploymentStatusTypesSchema.enum;
