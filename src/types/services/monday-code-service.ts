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

export type BASE_RESPONSE_HTTP_META_DATA = {
  statusCode: number;
  headers: Record<string, string>;
};
export type BASE_ERROR_RESPONSE = {
  title?: string;
  message?: string;
};
