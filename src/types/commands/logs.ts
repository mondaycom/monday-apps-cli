export enum LogType {
  HTTP = 'http',
  HTTP_HISTORY = 'http-history',
  CONSOLE = 'console',
  CONSOLE_HISTORY = 'console-history',
}

export type LogsFilterCriteriaArguments = {
  fromDate: Date;
  toDate: Date;
  text: string | undefined | null;
};

export type LogsCommandArguments = {
  appVersionId: number;
  logsType: LogType;
  logsFilterCriteria?: LogsFilterCriteriaArguments | null;
};
