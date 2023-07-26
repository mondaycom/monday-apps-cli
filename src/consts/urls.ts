import { LogType, LogsFilterCriteriaArguments } from 'types/commands/logs';
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

export const getLogsStreamForAppVersionIdUrl = (
  appVersionId: number,
  logsType: LogType,
  logsFilterCriteria?: LogsFilterCriteriaArguments | null,
): string => {
  const logsFilterCriteriaParams = logsFilterCriteria
    ? `&fromDate=${logsFilterCriteria.fromDate.getTime()}&toDate=${logsFilterCriteria.toDate.getTime()}&text=${encodeURIComponent(
        logsFilterCriteria.text || '',
      )}`
    : '';
  return `${appVersionIdBaseUrl(appVersionId)}/logs?type=${logsType}${logsFilterCriteriaParams}`;
};

export const listAppsUrl = (): string => {
  return BASE_APPS_URL;
};

export const listAppVersionsByAppIdUrl = (appId: AppId): string => {
  return `${BASE_APPS_URL}/${appId}/versions`;
};

export const appEnvironmentUrl = (appId: AppId, key: string): string => {
  return `/api/code/${appId}/env/${key}`;
};

export const appEnvironmentKeysUrl = (appId: AppId): string => {
  return `/api/code/${appId}/env-keys`;
};
