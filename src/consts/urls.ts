import { LogType } from 'types/commands/logs';

export const appVersionIdBaseUrl = (appVersionId: number): string => {
  return `/api/code/${appVersionId}`;
};

export const getAppVersionDeploymentStatusUrl = (appVersionId: number): string => {
  return `${appVersionIdBaseUrl(appVersionId)}/deployments`;
};

export const getDeploymentSignedUrl = (appVersionId: number): string => {
  return `${appVersionIdBaseUrl(appVersionId)}/deployments/signed-url`;
};

export const getLogsStreamForAppVersionIdUrl = (appVersionId: number, logsType: LogType): string => {
  return `${appVersionIdBaseUrl(appVersionId)}/logs?type=${logsType}`;
};
