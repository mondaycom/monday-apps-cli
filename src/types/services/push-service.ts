import { z } from 'zod';
import {
  appVersionDeploymentMetaDataSchema,
  appVersionDeploymentStatusSchema,
  deploymentStatusTypesSchema,
  signedUrlSchema,
} from '../../services/schemas/push-service-schemas.js';

export type signedUrl = z.infer<typeof signedUrlSchema>;

export type appVersionDeploymentMetaData = z.infer<typeof appVersionDeploymentMetaDataSchema>;

export type appVersionDeploymentStatus = z.infer<typeof appVersionDeploymentStatusSchema>;

export const deploymentStatusTypes = deploymentStatusTypesSchema.enum;
