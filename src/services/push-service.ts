import { getVersionStatusUrl, signUrl, versionIdUrl } from '../consts/urls.js';
import urlBuilder from '../utils/urls-builder.js';
import {
  APP_VERSION_DEPLOYMENT_META_DATA,
  APP_VERSION_DEPLOYMENT_STATUS,
  DEPLOYMENT_STATUS_TYPES,
  SIGNED_URL,
} from '../types/services/push-service.js';
import axios from 'axios';
import { execute } from './monday-code-service.js';
import { BASE_RESPONSE_HTTP_META_DATA, HTTP_METHOD_TYPES } from '../types/services/monday-code-service.js';
import logger from '../utils/logger.js';
import { ERROR_ON_UPLOADING_ZIP_FILE } from '../consts/messages.js';
import { pollPromise } from './polling-service.js';

export const getSignedStorageUrl = async (accessToken: string, appVersionId: number): Promise<string> => {
  const baseSignUrl = signUrl(appVersionId);
  const url = urlBuilder(baseSignUrl);
  const response = await execute<SIGNED_URL>({
    url,
    headers: { Accept: 'application/json' },
    method: HTTP_METHOD_TYPES.POST,
  });
  return response.signed!;
};

export const createAppVersionDeploymentJob = async (
  accessToken: string,
  appVersionId: number,
): Promise<APP_VERSION_DEPLOYMENT_META_DATA> => {
  const baseVersionIdUrl = versionIdUrl(appVersionId);
  const url = urlBuilder(baseVersionIdUrl);
  const response = await execute<BASE_RESPONSE_HTTP_META_DATA>({
    url,
    headers: { Accept: 'application/json' },
    method: HTTP_METHOD_TYPES.PUT,
  });
  const appVersionDeploymentMetaData: APP_VERSION_DEPLOYMENT_META_DATA = {
    location: response.headers?.location,
    retryAfter: response.headers?.['retry-after'] ? Number(response.headers?.['retry-after']) : undefined,
  };
  return appVersionDeploymentMetaData;
};

export const getAppVersionStatus = async (
  accessToken: string,
  appVersionId: number,
  retryAfter: number,
  progressLogger?: (message: string) => void,
): Promise<APP_VERSION_DEPLOYMENT_STATUS> => {
  const getAppVersionStatusInternal = async () => {
    const baseVersionIdStatusUrl = getVersionStatusUrl(appVersionId);
    const url = urlBuilder(baseVersionIdStatusUrl);
    const response = await execute<APP_VERSION_DEPLOYMENT_STATUS>({
      url,
      headers: { Accept: 'application/json' },
      method: HTTP_METHOD_TYPES.GET,
    });
    return response;
  };

  await pollPromise(
    async (): Promise<boolean> => {
      const statusesToKeepPolling = [DEPLOYMENT_STATUS_TYPES.started, DEPLOYMENT_STATUS_TYPES.pending];
      const response = await getAppVersionStatusInternal();
      if (statusesToKeepPolling.includes(response.status)) {
        if (progressLogger) {
          progressLogger(`Deployment state: ${response.status}`);
        }

        return false;
      }

      return true;
    },
    retryAfter,
    retryAfter * 20,
  );
  const response = await getAppVersionStatusInternal();
  return response;
};

export const uploadFileToStorage = async (
  cloudStorageUrl: string,
  fileData: Buffer,
  fileType: string,
): Promise<any> => {
  try {
    const response = await axios.put(cloudStorageUrl, fileData, {
      headers: { 'Content-Type': fileType },
    });
    return response;
  } catch (error: any) {
    logger.debug(error);
    throw new Error(ERROR_ON_UPLOADING_ZIP_FILE as string);
  }
};
