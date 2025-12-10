import { z } from 'zod';

import {
  appVersionDeploymentStatusSchema,
  deploymentStatusTypesSchema,
  securityScanFindingSchema,
  securityScanResponseSchema,
  securityScanSchema,
  signedUrlSchema,
  uploadClientSchema,
} from 'services/schemas/push-service-schemas';

export type SignedUrl = z.infer<typeof signedUrlSchema>;

export type uploadClient = z.infer<typeof uploadClientSchema>;

export type AppVersionDeploymentStatus = z.infer<typeof appVersionDeploymentStatusSchema>;

export const DeploymentStatusTypesSchema = deploymentStatusTypesSchema.enum;

export type SecurityScanFinding = z.infer<typeof securityScanFindingSchema>;
export type SecurityScanResult = z.infer<typeof securityScanSchema>;
export type SecurityScanResponse = z.infer<typeof securityScanResponseSchema>;
