export enum LogItemType {
  CONSOLE = 'console',
  HTTP_REQUESTS = 'http',
}

export enum LogItemSeverity {
  INFO = 'info',
  LOG = 'log',
  WARNING = 'warning',
  ERROR = 'error',
  UNDEFINED = 'undefined',
}

export type LogItem = {
  type: LogItemType;
  severity?: LogItemSeverity;
  message?: string | null;
  request?: {
    url: string;
    method: string;
    status: number;
    size: number;
    userAgent: string;
    remoteIp: string;
  };
  response?: { size: number };
  timestamp: Date;
};
