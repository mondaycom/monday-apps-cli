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

export type SecurityScanFinding = {
  tool: string;
  ruleId: string;
  severity: string;
  file: string;
  line: number | null;
  message: string;
  shortDescription: string;
  fullDescription: string;
  helpUri: string;
  help: string;
  precision: string;
};

export type SecurityScanResult = {
  version: string;
  timestamp: string;
  summary: {
    total: number;
    error: number;
    warning: number;
    note: number;
  };
  findings: SecurityScanFinding[];
};

export type SecurityScanFindingType = z.infer<typeof securityScanFindingSchema>;
export type SecurityScanResultType = z.infer<typeof securityScanSchema>;
export type SecurityScanResponse = z.infer<typeof securityScanResponseSchema>;
