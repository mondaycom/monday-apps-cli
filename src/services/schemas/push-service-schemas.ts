import { z } from 'zod';
import { baseResponseHttpMetaDataSchema } from './monday-code-service-schemas.js';

export const signedUrlSchema = z
  .object({
    signed: z.string(),
  })
  .merge(baseResponseHttpMetaDataSchema);

export const appVersionDeploymentMetaDataSchema = z.object({
  location: z.string().optional(),
  retryAfter: z.number().optional(),
});

export const deploymentStatusTypesArray = ['started', 'pending', 'successful', 'failed'] as const;
export const deploymentStatusTypesSchema = z.enum(deploymentStatusTypesArray);
export const appVersionDeploymentStatusSchema = z
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
