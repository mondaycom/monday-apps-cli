import { z } from 'zod';

import { ManifestFeatureSchema } from 'services/schemas/manifest-service-schemas';
import { AppId, AppVersionId } from 'types/general';

export type ManifestFeature = z.infer<typeof ManifestFeatureSchema>;

export type AppCreateCommandTasksContext = {
  appId?: AppId;
  appName?: string;
  appVersionId?: AppVersionId;
  features?: ManifestFeature[];
  githubUrl: string;
  folder: string;
  branch: string;
  targetPath: string;
};
