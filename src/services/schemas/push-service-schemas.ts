import { z } from 'zod';

import { baseResponseHttpMetaDataSchema } from 'services/schemas/api-service-schemas';

export const signedUrlSchema = z
  .object({
    signed: z.string(),
  })
  .merge(baseResponseHttpMetaDataSchema);

export const uploadClientSchema = z
  .object({
    data: z.object({
      data: z.object({
        url: z.string(),
        sourceUrl: z.string(),
      }),
    }),
  })
  .merge(baseResponseHttpMetaDataSchema);

export const tunnelAuthTokenSchema = z
  .object({
    token: z.string(),
    domain: z.string(),
  })
  .merge(baseResponseHttpMetaDataSchema);

export const tunnelDomainSchema = z
  .object({
    domain: z.string(),
  })
  .merge(baseResponseHttpMetaDataSchema);

export const deploymentStatusTypesArray = [
  'started',
  'pending',
  'building',
  'successful',
  'failed',
  'building-infra',
  'building-app',
  'deploying-app',
  'security-scan',
] as const;

export const deploymentStatusTypesSchema = z.enum(deploymentStatusTypesArray);

export const securityScanFindingSchema = z.object({
  tool: z.string().nullable(),
  ruleId: z.string().nullable(),
  severity: z.string().nullable(),
  file: z.string().nullable(),
  line: z.number().nullable(),
  message: z.string().nullable(),
  shortDescription: z.string().nullable(),
  fullDescription: z.string().nullable(),
  helpUri: z.string().nullable(),
  help: z.string().nullable(),
  precision: z.string().nullable(),
});

export const securityScanSchema = z.object({
  version: z.string(),
  timestamp: z.string(),
  summary: z.object({
    total: z.number(),
    error: z.number(),
    warning: z.number(),
    note: z.number(),
  }),
  findings: z.array(securityScanFindingSchema),
});

export const appVersionDeploymentStatusSchema = z
  .object({
    status: deploymentStatusTypesSchema,
    tip: z.string().optional(),
    deployment: z
      .object({
        url: z.string(),
        latestUrl: z.string(),
        liveUrl: z.string().optional(),
      })
      .optional(),
    error: z
      .object({
        message: z.string(),
      })
      .optional(),
    securityScanResults: securityScanSchema.optional(),
  })
  .merge(baseResponseHttpMetaDataSchema);

export const securityScanResponseSchema = z
  .object({
    securityScanResults: securityScanSchema.nullable(),
  })
  .merge(baseResponseHttpMetaDataSchema);
