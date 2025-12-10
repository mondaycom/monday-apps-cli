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
  tool: string | null;
  ruleId: string | null;
  severity: string | null;
  file: string | null;
  line: number | null;
  message: string | null;
  shortDescription: string | null;
  fullDescription: string | null;
  helpUri: string | null;
  help: string | null;
  precision: string | null;
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
