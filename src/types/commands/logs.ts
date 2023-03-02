export enum LogType {
  HTTP = 'http',
  CONSOLE = 'console',
}

export type LogsCommandArguments = {
  appFeatureId: number;
  logsType: LogType;
};
