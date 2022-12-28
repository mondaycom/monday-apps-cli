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
  headers?: object;
  timeout?: number;
};

export enum HTTP_METHOD_TYPES {
  POST = 'post',
  GET = 'get',
  DELETE = 'delete',
  PUT = 'put',
}

export type baseResponseHttpMetaData = z.infer<typeof baseResponseHttpMetaDataSchema>;
export type baseErrorResponse = z.infer<typeof baseErrorResponseSchema>;
