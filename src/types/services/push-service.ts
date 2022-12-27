import { BASE_RESPONSE_HTTP_META_DATA } from './monday-code-service.js';

export type SIGNED_URL = {
  signed?: string;
} & BASE_RESPONSE_HTTP_META_DATA;

export type APP_VERSION_DEPLOYMENT_META_DATA = {
  location?: string;
  retryAfter?: number;
};
export enum DEPLOYMENT_STATUS_TYPES {
  started = 'started',
  pending = 'pending',
  successful = 'successful',
  failed = 'failed',
}
export type APP_VERSION_DEPLOYMENT_STATUS = {
  status: DEPLOYMENT_STATUS_TYPES;
  deployment?: {
    url: string;
  };
  error?: {
    message: string;
  };
} & BASE_RESPONSE_HTTP_META_DATA;
