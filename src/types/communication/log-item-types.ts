export enum LogItemType {
  CONSOLE = 'console',
  HTTP_REQUESTS = 'http',
}

export enum LogItemSeverity {
  INFO = 'INFO',
  LOG = 'LOG',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  DEFAULT = 'DEFAULT',
  DEBUG = 'DEBUG',
  UNDEFINED = 'UNDEFINED',
}

export type LogItem = {
  type: LogItemType;
  severity?: LogItemSeverity;
  message?: string;
  request?: {
    url: string;
    method: string;
    size: number;
    userAgent: string;
    remoteIp: string;
  };
  response?: {
    status: number;
    size: number;
  };
  timestamp: Date;
};
