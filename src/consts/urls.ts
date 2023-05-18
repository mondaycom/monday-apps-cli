import { LogType } from '../types/commands/logs';

export const appVersionIdDeploymentUrl = (appVersionId: number): string => {
  return `/deployments/appfeature/${appVersionId}`;
};

export const getAppVersionDeploymentUrl = (appVersionId: number): string => {
  return `${appVersionIdDeploymentUrl(appVersionId)}`;
};

export const deploymentSignUrl = (appVersionId: number): string => {
  return `${appVersionIdDeploymentUrl(appVersionId)}/signed-url`;
};

export const appVersionIdLogsUrl = (appVersionId: number): string => {
  return `/api/code/${appVersionId}`;
};

export const logsStreamForAppVersionIdUrl = (appVersionId: number, logsType: LogType): string => {
  return `${appVersionIdLogsUrl(appVersionId)}/logs?type=${logsType}`;
};
