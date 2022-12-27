import { getVersionStatusUrl, signUrl, versionIdUrl } from '../consts/urls.js';
import urlBuilder from '../utils/urls-builder.js';
import {
  APP_VERSION_DEPLOYMENT_META_DATA,
  APP_VERSION_DEPLOYMENT_STATUS,
  APP_VERSION_DEPLOYMENT_STATUS_SCHEMA,
  DEPLOYMENT_STATUS_TYPES,
  SIGNED_URL,
  SIGNED_URL_SCHEMA,
} from '../types/services/push-service.js';
import axios from 'axios';
import { execute } from './monday-code-service.js';
import {
  BASE_RESPONSE_HTTP_META_DATA,
  BASE_RESPONSE_HTTP_META_DATA_SCHEMA,
  HTTP_METHOD_TYPES,
} from '../types/services/monday-code-service.js';
import logger from '../utils/logger.js';
import {
  ERROR_ON_UPLOADING_ZIP_FILE,
  FAILED_SIGNED_URL,
  FAILED_START_VERSION_DEPLOYMENT,
  FAILED_TO_CHECK_APP_VERSION_DEPLOYMENT_STATUS,
} from '../consts/messages.js';
import { pollPromise } from './polling-service.js';
import { ErrorMondayCode } from '../types/errors/index.js';

export const getSignedStorageUrl = async (accessToken: string, appVersionId: number): Promise<string> => {
  try {
    const baseSignUrl = signUrl(appVersionId);
    const url = urlBuilder(baseSignUrl);
    const response = await execute<SIGNED_URL>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HTTP_METHOD_TYPES.POST,
      },
      SIGNED_URL_SCHEMA,
    );
    return response.signed;
  } catch (error_: any | ErrorMondayCode) {
    const error = error_ instanceof ErrorMondayCode ? error_ : new Error(FAILED_SIGNED_URL);
    throw error;
  }
};

export const createAppVersionDeploymentJob = async (
  accessToken: string,
  appVersionId: number,
): Promise<APP_VERSION_DEPLOYMENT_META_DATA> => {
  try {
    const baseVersionIdUrl = versionIdUrl(appVersionId);
    const url = urlBuilder(baseVersionIdUrl);
    const response = await execute<BASE_RESPONSE_HTTP_META_DATA>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HTTP_METHOD_TYPES.PUT,
      },
      BASE_RESPONSE_HTTP_META_DATA_SCHEMA,
    );
    const appVersionDeploymentMetaData: APP_VERSION_DEPLOYMENT_META_DATA = {
      location: response.headers?.location,
      retryAfter: response.headers?.['retry-after'] ? Number(response.headers?.['retry-after']) : undefined,
    };
    return appVersionDeploymentMetaData;
  } catch (error_: any | ErrorMondayCode) {
    const error = error_ instanceof ErrorMondayCode ? error_ : new Error(FAILED_START_VERSION_DEPLOYMENT);
    throw error;
  }
};

export const getAppVersionStatus = async (
  accessToken: string,
  appVersionId: number,
  retryAfter: number,
  progressLogger?: (message: string) => void,
): Promise<APP_VERSION_DEPLOYMENT_STATUS> => {
  const getAppVersionStatusInternal = async () => {
    try {
      const baseVersionIdStatusUrl = getVersionStatusUrl(appVersionId);
      const url = urlBuilder(baseVersionIdStatusUrl);
      const response = await execute<APP_VERSION_DEPLOYMENT_STATUS>(
        {
          url,
          headers: { Accept: 'application/json' },
          method: HTTP_METHOD_TYPES.GET,
        },
        APP_VERSION_DEPLOYMENT_STATUS_SCHEMA,
      );
      return response;
    } catch (error_: any | ErrorMondayCode) {
      const error =
        error_ instanceof ErrorMondayCode ? error_ : new Error(FAILED_TO_CHECK_APP_VERSION_DEPLOYMENT_STATUS);
      throw error;
    }
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
    throw new Error(ERROR_ON_UPLOADING_ZIP_FILE);
  }
};
