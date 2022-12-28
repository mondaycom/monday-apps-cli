import { z } from 'zod';
import {
  baseErrorResponseSchema,
  baseResponseHttpMetaDataSchema,
} from '../../services/schemas/monday-code-service-schemas.js';

export type EXECUTE_PARAMS = {
  body?: object;
  query?: object;
  url: string;
  method: HTTP_METHOD_TYPES;
  headers?: Record<string, string>;
  timeout?: number;
};

export enum HTTP_METHOD_TYPES {
  POST = 'post',
  GET = 'get',
  DELETE = 'delete',
  PUT = 'put',
}

export type BaseResponseHttpMetaData = z.infer<typeof baseResponseHttpMetaDataSchema>;
export type BaseErrorResponse = z.infer<typeof baseErrorResponseSchema>;
