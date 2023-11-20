import { LogType, LogsFilterCriteriaArguments } from 'types/commands/logs';
import { AppId } from 'types/general';

const BASE_APPS_URL = '/api/apps';
const BASE_MONDAY_CODE_URL = '/api/code';

export const appVersionIdBaseUrl = (appVersionId: number): string => {
  return `/api/code/${appVersionId}`;
};

export const getAppVersionDeploymentStatusUrl = (appVersionId: number): string => {
  return `${appVersionIdBaseUrl(appVersionId)}/deployments`;
};

export const getDeploymentSignedUrl = (appVersionId: number): string => {
  return `${appVersionIdBaseUrl(appVersionId)}/deployments/signed-url`;
};

export const getStorageItemsSearchUrl = (appId: number, clientAccountId: number, term: string): string => {
  return `/api/storage/app/${appId}/account/${clientAccountId}/records?term=${encodeURI(term)}`;
};

export const getStorageItemsExportUrl = (appId: number, clientAccountId: number): string => {
  return `/api/storage/app/${appId}/account/${clientAccountId}/records/export`;
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

export const appReleasesUrl = (appVersionId: AppId): string => {
  return `/apps_ms/app-versions/${appVersionId}/releases`;
};

export const generateTunnelingTokenUrl = (): string => {
  return `${BASE_MONDAY_CODE_URL}/tunnel-token`;
};
