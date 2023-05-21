import axios from 'axios';

import { getAppVersionDeploymentStatusUrl, getDeploymentSignedUrl } from 'consts/urls';
import { execute } from 'services/monday-code-service.js';
import { pollPromise } from 'services/polling-service';
import { appVersionDeploymentStatusSchema, signedUrlSchema } from 'services/schemas/push-service-schemas';
import { ErrorMondayCode } from 'types/errors';
import { HttpMethodTypes } from 'types/services/monday-code-service';
import { AppVersionDeploymentStatus, DeploymentStatusTypesSchema, SignedUrl } from 'types/services/push-service';
import logger from 'utils/logger';
import { appsUrlBuilder } from 'utils/urls-builder';

export const getSignedStorageUrl = async (accessToken: string, appVersionId: number): Promise<string> => {
  try {
    const baseSignUrl = getDeploymentSignedUrl(appVersionId);
    const url = appsUrlBuilder(baseSignUrl);
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
    logger.debug(error);
    if (error instanceof ErrorMondayCode) {
      throw error;
    }

    throw new Error('Failed to build remote location for upload.');
  }
};

export const getDeploymentStatus = async (
  accessToken: string,
  appVersionId: number,
  retryAfter: number,
  options: { ttl?: number; progressLogger?: (message: string) => void } = {},
): Promise<AppVersionDeploymentStatus> => {
  const { ttl, progressLogger } = options;
  const getAppVersionStatusInternal = async () => {
    try {
      const baseFeatureIdStatusUrl = getAppVersionDeploymentStatusUrl(appVersionId);
      const url = appsUrlBuilder(baseFeatureIdStatusUrl);
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
    ttl || retryAfter * 60,
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
    throw new Error('Failed in uploading the project.');
  }
};
