import { z } from 'zod';
import { baseResponseHttpMetaDataSchema } from './monday-code-service-schemas.js';

export const signedUrlSchema = z
  .object({
    signed: z.string(),
  })
  .merge(baseResponseHttpMetaDataSchema);

export const deploymentStatusTypesArray = ['started', 'pending', 'successful', 'failed'] as const;
export const deploymentStatusTypesSchema = z.enum(deploymentStatusTypesArray);
export const appFeatureDeploymentStatusSchema = z
  .object({
    status: deploymentStatusTypesSchema,
    deployment: z
      .object({
        url: z.string(),
      })
      .optional(),
    error: z
      .object({
        message: z.string(),
      })
      .optional(),
  })
  .merge(baseResponseHttpMetaDataSchema);
