import { z } from 'zod';
import { BASE_RESPONSE_HTTP_META_DATA_SCHEMA } from './monday-code-service.js';

export const SIGNED_URL_SCHEMA = z
  .object({
    signed: z.string(),
  })
  .merge(BASE_RESPONSE_HTTP_META_DATA_SCHEMA);
export type SIGNED_URL = z.infer<typeof SIGNED_URL_SCHEMA>;

export const APP_VERSION_DEPLOYMENT_META_DATA = z.object({
  location: z.string().optional(),
  retryAfter: z.number().optional(),
});
export type APP_VERSION_DEPLOYMENT_META_DATA = z.infer<typeof APP_VERSION_DEPLOYMENT_META_DATA>;

export enum DEPLOYMENT_STATUS_TYPES {
  started = 'started',
  pending = 'pending',
  successful = 'successful',
  failed = 'failed',
}

export const APP_VERSION_DEPLOYMENT_STATUS_SCHEMA = z
  .object({
    status: z.nativeEnum(DEPLOYMENT_STATUS_TYPES),
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
  .merge(BASE_RESPONSE_HTTP_META_DATA_SCHEMA);
export type APP_VERSION_DEPLOYMENT_STATUS = z.infer<typeof APP_VERSION_DEPLOYMENT_STATUS_SCHEMA>;
