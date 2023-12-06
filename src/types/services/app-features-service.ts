import { z } from 'zod';

import {
  appFeatureSchema,
  createAppFeatureReleaseSchema,
  listAppFeaturesSchema,
} from 'src/services/schemas/app-features-schemas';

export type AppFeature = z.infer<typeof appFeatureSchema>;
export type ListAppFeatureResponse = z.infer<typeof listAppFeaturesSchema>;
export type CreateAppFeatureReleaseResponse = z.infer<typeof createAppFeatureReleaseSchema>;
export enum BUILD_TYPES {
  CUSTOM_URL = 'custom_url',
  MONDAY_CODE = 'monday_code',
}
