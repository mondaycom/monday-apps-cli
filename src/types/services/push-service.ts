import { BASE_RESPONSE_HTTP_META_DATA } from './monday-code-service.js';

export type SIGNED_URL = {
  signed?: string;
} & BASE_RESPONSE_HTTP_META_DATA;
