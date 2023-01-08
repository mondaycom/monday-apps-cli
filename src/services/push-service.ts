import { getAppFeatureDeploymentUrl, deploymentSignUrl } from '../consts/urls.js';
import urlBuilder from '../utils/urls-builder.js';
import { AppVersionDeploymentStatus, DeploymentStatusTypesSchema, SignedUrl } from '../types/services/push-service.js';
import axios from 'axios';
import { execute } from './monday-code-service.js';
import { HttpMethodTypes } from '../types/services/monday-code-service.js';
import logger from '../utils/logger.js';
import { pollPromise } from './polling-service.js';
import { ErrorMondayCode } from '../types/errors/index.js';
import { appVersionDeploymentStatusSchema, signedUrlSchema } from './schemas/push-service-schemas.js';

export const getSignedStorageUrl = async (accessToken: string, appVersionId: number): Promise<string> => {
  try {
    const baseSignUrl = deploymentSignUrl(appVersionId);
    const url = urlBuilder(baseSignUrl);
    const response = await execute<SignedUrl>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.POST,
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

export const getAppFeatureIdStatus = async (
  accessToken: string,
  appFeatureId: number,
  retryAfter: number,
  progressLogger?: (message: string) => void,
): Promise<AppVersionDeploymentStatus> => {
  const getAppVersionStatusInternal = async () => {
    try {
      const baseVersionIdStatusUrl = getAppFeatureDeploymentUrl(appFeatureId);
      const url = urlBuilder(baseVersionIdStatusUrl);
      const response = await execute<AppVersionDeploymentStatus>(
        {
          url,
          headers: { Accept: 'application/json' },
          method: HttpMethodTypes.GET,
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
      const statusesToKeepPolling: string[] = [
        DeploymentStatusTypesSchema.started,
        DeploymentStatusTypesSchema.pending,
      ];
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
