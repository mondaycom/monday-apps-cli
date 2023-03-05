export enum StreamLogType {
  HTTP = 'http',
  CONSOLE = 'console',
  DISCONNECT = 'disconnect',
}

export type StreamMessage = {
  data: any;
  type: StreamLogType;
};
