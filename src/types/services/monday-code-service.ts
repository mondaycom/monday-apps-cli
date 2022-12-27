import { z } from 'zod';

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

export const BASE_RESPONSE_HTTP_META_DATA_SCHEMA = z.object({
  statusCode: z.number(),
  headers: z.record(z.string(), z.string()),
});
export type BASE_RESPONSE_HTTP_META_DATA = z.infer<typeof BASE_RESPONSE_HTTP_META_DATA_SCHEMA>;

export const BASE_ERROR_RESPONSE_SCHEMA = z.object({
  title: z.string().optional(),
  message: z.string().optional(),
});
export type BASE_ERROR_RESPONSE = z.infer<typeof BASE_ERROR_RESPONSE_SCHEMA>;
