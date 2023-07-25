export enum StreamLogType {
  HTTP = 'http',
  HTTP_HISTORY = 'http-history',
  CONSOLE = 'console',
  CONSOLE_HISTORY = 'console-history',
  DISCONNECT = 'disconnect',
}

export type StreamMessage = {
  data: any;
  type: StreamLogType;
};
