export type ExecuteParams = {
  body?: object;
  query?: object;
  url: string;
  method: HTTP_METHOD_TYPES;
  headers?: object;
  timeout?: number
};

export enum HTTP_METHOD_TYPES {
  POST = 'post',
  GET = 'get',
  DELETE = 'delete',
  PUT = 'put'
}
