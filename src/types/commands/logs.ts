export enum LogType {
  HTTP = 'http',
  HTTP_HISTORY = 'http-history',
  CONSOLE = 'console',
  CONSOLE_HISTORY = 'console-history',
}

export type LogsFilterCriteriaArguments = {
  fromDate: Date;
  toDate: Date;
  text?: string;
};

export type LogsCommandArguments = {
  appVersionId: number;
  logsType: LogType;
  logsFilterCriteria?: LogsFilterCriteriaArguments | null;
};

export enum EventSource {
  LIVE = 'live',
  HISTORY = 'history',
}
