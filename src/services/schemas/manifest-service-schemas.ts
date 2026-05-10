import { z } from 'zod';

import { getValidAppFeatureTypes } from 'services/app-feature-types-service';
import { BUILD_TYPES_MANIFEST_FORMAT } from 'types/services/app-features-service';
import { ManifestHostingType } from 'types/services/manifest-service';

const ManifestHostingSchema = z
  .object({
    type: z.nativeEnum(ManifestHostingType),
    path: z.string(),
  })
  .strict();

export const ManifestFeatureSchema = z.object({
  type: z.string().refine(
    val => getValidAppFeatureTypes().includes(val),
    val => ({
      message: `Unknown app feature type: ${val}`,
    }),
  ),
  name: z.string().optional(),
  build: z
    .object({
      source: z.nativeEnum(BUILD_TYPES_MANIFEST_FORMAT),
      suffix: z.string().optional(),
    })
    .optional(),
});

export const ManifestFileSchema = z
  .object({
    version: z.string(),
    app: z
      .object({
        id: z.string().optional(),
        name: z.string().optional(),
        hosting: z
          .object({
            cdn: ManifestHostingSchema.optional(),
            server: ManifestHostingSchema.optional(),
          })
          .strict()
          .optional(),
        features: z.array(ManifestFeatureSchema).optional(),
      })
      .strict(),
  })
  .strict();
