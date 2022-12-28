import { getVersionStatusDeploymentUrl, deploymentSignUrl, versionIdDeploymentUrl } from '../consts/urls.js';
import urlBuilder from '../utils/urls-builder.js';
import {
  appVersionDeploymentMetaData,
  appVersionDeploymentStatus,
  deploymentStatusTypes,
  signedUrl,
} from '../types/services/push-service.js';
import axios from 'axios';
import { execute } from './monday-code-service.js';
import { baseResponseHttpMetaData, HTTP_METHOD_TYPES } from '../types/services/monday-code-service.js';
import logger from '../utils/logger.js';
import { pollPromise } from './polling-service.js';
import { ErrorMondayCode } from '../types/errors/index.js';
import { appVersionDeploymentStatusSchema, signedUrlSchema } from './schemas/push-service-schemas.js';
import { baseResponseHttpMetaDataSchema } from './schemas/monday-code-service-schemas.js';

export const getSignedStorageUrl = async (accessToken: string, appVersionId: number): Promise<string> => {
  try {
    const baseSignUrl = deploymentSignUrl(appVersionId);
    const url = urlBuilder(baseSignUrl);
    const response = await execute<signedUrl>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HTTP_METHOD_TYPES.POST,
      },
      signedUrlSchema,
    );
    return response.signed;
  } catch (error: any | ErrorMondayCode) {
    if (error instanceof ErrorMondayCode) {
      throw error;
    }

    throw new Error('Failed to build remote location for upload.');
  }
};

export const createAppVersionDeploymentJob = async (
  accessToken: string,
  appVersionId: number,
): Promise<appVersionDeploymentMetaData> => {
  try {
    const baseVersionIdUrl = versionIdDeploymentUrl(appVersionId);
    const url = urlBuilder(baseVersionIdUrl);
    const response = await execute<baseResponseHttpMetaData>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HTTP_METHOD_TYPES.PUT,
      },
      baseResponseHttpMetaDataSchema,
    );
    const appVersionDeploymentMetaData: appVersionDeploymentMetaData = {
      location: response.headers?.location,
      retryAfter: response.headers?.['retry-after'] ? Number(response.headers?.['retry-after']) : undefined,
    };
    return appVersionDeploymentMetaData;
  } catch (error_: any | ErrorMondayCode) {
    const error =
      error_ instanceof ErrorMondayCode ? error_ : new Error('Failed to start app version deployment process.');
    throw error;
  }
};

export const getAppVersionStatus = async (
  accessToken: string,
  appVersionId: number,
  retryAfter: number,
  progressLogger?: (message: string) => void,
): Promise<appVersionDeploymentStatus> => {
  const getAppVersionStatusInternal = async () => {
    try {
      const baseVersionIdStatusUrl = getVersionStatusDeploymentUrl(appVersionId);
      const url = urlBuilder(baseVersionIdStatusUrl);
      const response = await execute<appVersionDeploymentStatus>(
        {
          url,
          headers: { Accept: 'application/json' },
          method: HTTP_METHOD_TYPES.GET,
        },
        appVersionDeploymentStatusSchema,
      );
      return response;
    } catch (error_: any | ErrorMondayCode) {
      const error =
        error_ instanceof ErrorMondayCode ? error_ : new Error('Failed to check app version deployment status.');
      throw error;
    }
  };

  await pollPromise(
    async (): Promise<boolean> => {
      const statusesToKeepPolling: string[] = [deploymentStatusTypes.started, deploymentStatusTypes.pending];
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
    throw new Error('Failed in uploading the zip file.');
  }
};
