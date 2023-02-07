import { getAppFeatureDeploymentUrl, deploymentSignUrl } from '../consts/urls.js';
import urlBuilder from '../utils/urls-builder.js';
import { AppFeatureDeploymentStatus, DeploymentStatusTypesSchema, SignedUrl } from '../types/services/push-service.js';
import axios from 'axios';
import { execute } from './monday-code-service.js';
import { HttpMethodTypes } from '../types/services/monday-code-service.js';
import logger from '../utils/logger.js';
import { pollPromise } from './polling-service.js';
import { ErrorMondayCode } from '../types/errors/index.js';
import { appFeatureDeploymentStatusSchema, signedUrlSchema } from './schemas/push-service-schemas.js';

export const getSignedStorageUrl = async (accessToken: string, appFeatureId: number): Promise<string> => {
  try {
    const baseSignUrl = deploymentSignUrl(appFeatureId);
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

    logger.debug(error);
    throw new Error('Failed to build remote location for upload.');
  }
};

export const getAppFeatureIdStatus = async (
  accessToken: string,
  appFeatureId: number,
  retryAfter: number,
  options: { ttl?: number; progressLogger?: (message: string) => void } = {},
): Promise<AppFeatureDeploymentStatus> => {
  const { ttl, progressLogger } = options;
  const getAppFeatureStatusInternal = async () => {
    try {
      const baseFeatureIdStatusUrl = getAppFeatureDeploymentUrl(appFeatureId);
      const url = urlBuilder(baseFeatureIdStatusUrl);
      const response = await execute<AppFeatureDeploymentStatus>(
        {
          url,
          headers: { Accept: 'application/json' },
          method: HttpMethodTypes.GET,
        },
        appFeatureDeploymentStatusSchema,
      );
      return response;
    } catch (error_: any | ErrorMondayCode) {
      const error =
        error_ instanceof ErrorMondayCode ? error_ : new Error('Failed to check app feature deployment status.');
      throw error;
    }
  };

  await pollPromise(
    async (): Promise<boolean> => {
      const statusesToKeepPolling: string[] = [
        DeploymentStatusTypesSchema.started,
        DeploymentStatusTypesSchema.pending,
        DeploymentStatusTypesSchema.building,
        DeploymentStatusTypesSchema['building-infra'],
        DeploymentStatusTypesSchema['building-app'],
      ];
      const response = await getAppFeatureStatusInternal();
      if (statusesToKeepPolling.includes(response.status)) {
        if (progressLogger) {
          progressLogger(`Deployment state: ${response.status}`);
        }

        return false;
      }

      return true;
    },
    retryAfter,
    ttl || retryAfter * 60,
  );
  const response = await getAppFeatureStatusInternal();
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
    throw new Error('Failed in uploading the project.');
  }
};
