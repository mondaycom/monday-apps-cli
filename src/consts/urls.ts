import { LogType } from 'types/commands/logs';
import { AppId } from 'types/general';

const BASE_APPS_URL = '/api/apps';

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

export const listAppsUrl = (): string => {
  return BASE_APPS_URL;
};

export const listAppVersionsByAppIdUrl = (appId: AppId): string => {
  return `${BASE_APPS_URL}/${appId}/versions`;
};
