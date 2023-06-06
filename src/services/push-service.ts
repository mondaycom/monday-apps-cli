import axios from 'axios';
import { ListrTaskWrapper } from 'listr2';

import { getAppVersionDeploymentStatusUrl, getDeploymentSignedUrl } from 'consts/urls';
import { getCurrentWorkingDirectory } from 'services/env-service';
import { createTarGzArchive, readFileData } from 'services/files-service';
import { execute } from 'services/monday-code-service.js';
import { pollPromise } from 'services/polling-service';
import {
  appVersionDeploymentStatusSchema,
  deploymentStatusTypesSchema,
  signedUrlSchema,
} from 'services/schemas/push-service-schemas';
import { PushCommandTasksContext } from 'types/commands/push';
import { ErrorMondayCode } from 'types/errors';
import { TimeInMs } from 'types/general/time';
import { HttpMethodTypes } from 'types/services/monday-code-service';
import { AppVersionDeploymentStatus, DeploymentStatusTypesSchema, SignedUrl } from 'types/services/push-service';
import logger from 'utils/logger';
import { createProgressBarString } from 'utils/progress-bar';
import { appsUrlBuilder } from 'utils/urls-builder';

export const getSignedStorageUrl = async (appVersionId: number): Promise<string> => {
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

export const getAppVersionDeploymentStatus = async (appVersionId: number) => {
  try {
    const baseAppVersionIdStatusUrl = getAppVersionDeploymentStatusUrl(appVersionId);
    const url = appsUrlBuilder(baseAppVersionIdStatusUrl);
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

export const pollForDeploymentStatus = async (
  appVersionId: number,
  retryAfter: number,
  options: { ttl?: number; progressLogger?: (message: keyof typeof DeploymentStatusTypesSchema) => void } = {},
): Promise<AppVersionDeploymentStatus> => {
  const { ttl, progressLogger } = options;

  await pollPromise(
    async (): Promise<boolean> => {
      const statusesToKeepPolling: string[] = [
        DeploymentStatusTypesSchema.started,
        DeploymentStatusTypesSchema.pending,
        DeploymentStatusTypesSchema.building,
        DeploymentStatusTypesSchema['building-infra'],
        DeploymentStatusTypesSchema['building-app'],
      ];
      const response = await getAppVersionDeploymentStatus(appVersionId);
      if (statusesToKeepPolling.includes(response.status)) {
        if (progressLogger) {
          progressLogger(response.status);
        }

        return false;
      }

      return true;
    },
    retryAfter,
    ttl || retryAfter * 60,
  );
  const response = await getAppVersionDeploymentStatus(appVersionId);
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

export const buildAssetToDeployTask =
  (providedDirectoryPath?: string) =>
  async (ctx: PushCommandTasksContext, task: ListrTaskWrapper<PushCommandTasksContext, any>) => {
    try {
      let directoryPath = providedDirectoryPath;
      if (!directoryPath) {
        const currentDirectoryPath = getCurrentWorkingDirectory();
        logger.debug(`Directory path not provided using current directory: ${currentDirectoryPath}`);
        directoryPath = currentDirectoryPath;
      }

      task.output = `Building asset to deploy from "${directoryPath}" directory`;
      const archivePath = await createTarGzArchive(directoryPath, 'code');
      ctx.archivePath = archivePath;
      ctx.showPrepareEnvironmentTask = true;
    } catch (error) {
      logger.debug(error);
      throw error;
    }
  };

export const prepareEnvironmentTask = async (ctx: PushCommandTasksContext) => {
  const signedCloudStorageUrl = await getSignedStorageUrl(ctx.appVersionId);
  const archiveContent = readFileData(ctx.archivePath!);
  ctx.signedCloudStorageUrl = signedCloudStorageUrl;
  ctx.archiveContent = archiveContent;
  ctx.showUploadAssetTask = true;
};

export const uploadAssetTask = async (
  ctx: PushCommandTasksContext,
  task: ListrTaskWrapper<PushCommandTasksContext, any>,
) => {
  const { signedCloudStorageUrl, archiveContent } = ctx;
  await uploadFileToStorage(signedCloudStorageUrl!, archiveContent!, 'application/zip');
  task.title = 'Asset uploaded successfully';
  ctx.showHandleDeploymentTask = true;
};

const STATUS_TO_PROGRESS_VALUE: Record<keyof typeof DeploymentStatusTypesSchema, number> = {
  [DeploymentStatusTypesSchema.failed]: 0,
  [DeploymentStatusTypesSchema.started]: 0,
  [DeploymentStatusTypesSchema.pending]: 5,
  [DeploymentStatusTypesSchema.building]: 10,
  [DeploymentStatusTypesSchema['building-infra']]: 33,
  [DeploymentStatusTypesSchema['building-app']]: 66,
  [DeploymentStatusTypesSchema.successful]: 100,
};

const finalizeDeployment = (
  deploymentStatus: AppVersionDeploymentStatus,
  task: ListrTaskWrapper<PushCommandTasksContext, any>,
) => {
  if (deploymentStatus.status === deploymentStatusTypesSchema.enum.failed) {
    task.title = deploymentStatus.error?.message || 'Deployment process has failed';
    throw new Error(task.title);
  } else if (deploymentStatus.deployment) {
    const deploymentUrl = `Deployment successfully finished, deployment url: ${deploymentStatus.deployment.url}`;
    task.title = deploymentUrl;
  } else {
    const generalErrorMessage = 'Something went wrong, the deployment url is missing.';
    task.title = generalErrorMessage;
    throw new Error(generalErrorMessage);
  }
};

export const handleDeploymentTask = async (
  ctx: PushCommandTasksContext,
  task: ListrTaskWrapper<PushCommandTasksContext, any>,
) => {
  task.output = createProgressBarString(100, 0);
  const now = Date.now();
  const deploymentStatus = await pollForDeploymentStatus(ctx.appVersionId, TimeInMs.second * 5, {
    ttl: TimeInMs.minute * 30,
    progressLogger: (message: keyof typeof DeploymentStatusTypesSchema) => {
      const deltaInSeconds = (Date.now() - now) / TimeInMs.second;
      task.title = `Deployment in progress: ${message}`;
      task.output = createProgressBarString(100, STATUS_TO_PROGRESS_VALUE[message], deltaInSeconds);
    },
  });

  finalizeDeployment(deploymentStatus, task);
};
