import { z } from 'zod';

import { ManifestHostingType } from 'types/services/manifest-service';

const ManifestHostingSchema = z
  .object({
    type: z.nativeEnum(ManifestHostingType),
    path: z.string(),
  })
  .strict();

export const ManifestFileSchema = z
  .object({
    version: z.string(),
    app: z
      .object({
        id: z.string().optional(),
        hosting: z
          .object({
            cdn: ManifestHostingSchema.optional(),
            server: ManifestHostingSchema.optional(),
          })
          .strict(),
      })
      .strict(),
  })
  .strict();
