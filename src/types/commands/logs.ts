export enum LogType {
  HTTP = 'http',
  CONSOLE = 'console',
}

export type LogsCommandArguments = {
  appVersionId: number;
  logsType: LogType;
};
