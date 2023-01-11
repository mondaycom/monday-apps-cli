import { z } from 'zod';
import {
  appFeatureDeploymentStatusSchema,
  deploymentStatusTypesSchema,
  signedUrlSchema,
} from '../../services/schemas/push-service-schemas.js';

export type SignedUrl = z.infer<typeof signedUrlSchema>;

export type AppFeatureDeploymentStatus = z.infer<typeof appFeatureDeploymentStatusSchema>;

export const DeploymentStatusTypesSchema = deploymentStatusTypesSchema.enum;
