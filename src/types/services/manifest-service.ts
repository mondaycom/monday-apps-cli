import { z } from 'zod';

export enum ManifestHostingType {
  Upload = 'upload',
  Github = 'github',
  Url = 'url',
}

const ManifestHostingSchema = z.object({
  type: z.nativeEnum(ManifestHostingType),
  path: z.string(),
});

export const ManifestFileSchema = z.object({
  version: z.string(),
  app: z.object({
    id: z.string().optional(),
    hosting: z.object({
      cdn: ManifestHostingSchema.optional(),
      server: ManifestHostingSchema.optional(),
    }),
  }),
});
