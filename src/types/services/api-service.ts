import { z } from 'zod';

import { baseErrorResponseSchema, baseResponseHttpMetaDataSchema } from 'services/schemas/api-service-schemas';

export type ExecuteParams = {
  body?: object;
  query?: object;
  url: string;
  method: HttpMethodTypes;
  headers?: Record<string, string>;
  timeout?: number;
};

export enum HttpMethodTypes {
  POST = 'post',
  GET = 'get',
  DELETE = 'delete',
  PUT = 'put',
}

export type BaseResponseHttpMetaData = z.infer<typeof baseResponseHttpMetaDataSchema>;
export type BaseErrorResponse = z.infer<typeof baseErrorResponseSchema>;
