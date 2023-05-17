import { LogType } from '../types/commands/logs';

export const appFeatureIdDeploymentUrl = (appFeatureId: number): string => {
  return `/deployments/appfeature/${appFeatureId}`;
};

export const getAppFeatureDeploymentUrl = (appFeatureId: number): string => {
  return `${appFeatureIdDeploymentUrl(appFeatureId)}`;
};

export const deploymentSignUrl = (appFeatureId: number): string => {
  return `${appFeatureIdDeploymentUrl(appFeatureId)}/signed-url`;
};

export const appVersionIdLogsUrl = (appVersionId: number): string => {
  return `/api/code/${appVersionId}`;
};

export const logsStreamForAppVersionIdUrl = (appVersionId: number, logsType: LogType): string => {
  return `${appVersionIdLogsUrl(appVersionId)}/logs?type=${logsType}`;
};
