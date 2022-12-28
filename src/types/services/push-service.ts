import { z } from 'zod';
import {
  appVersionDeploymentMetaDataSchema,
  appVersionDeploymentStatusSchema,
  deploymentStatusTypesSchema,
  signedUrlSchema,
} from '../../services/schemas/push-service-schemas.js';

export type SignedUrl = z.infer<typeof signedUrlSchema>;

export type AppVersionDeploymentMetaData = z.infer<typeof appVersionDeploymentMetaDataSchema>;

export type AppVersionDeploymentStatus = z.infer<typeof appVersionDeploymentStatusSchema>;

export const DeploymentStatusTypesSchema = deploymentStatusTypesSchema.enum;
