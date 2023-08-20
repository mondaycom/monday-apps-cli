import axios from 'axios';
import { ListrTaskWrapper } from 'listr2';

import { getAppVersionDeploymentStatusUrl, getDeploymentSignedUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { getCurrentWorkingDirectory } from 'services/env-service';
import { createTarGzArchive, readFileData } from 'services/files-service';
import { pollPromise } from 'services/polling-service';
import { appVersionDeploymentStatusSchema, signedUrlSchema } from 'services/schemas/push-service-schemas';
import { PushCommandTasksContext } from 'types/commands/push';
import { HttpError } from 'types/errors';
import { TimeInMs } from 'types/general/time';
import { HttpMethodTypes } from 'types/services/api-service';
import { AppVersionDeploymentStatus, DeploymentStatusTypesSchema, SignedUrl } from 'types/services/push-service';
import logger from 'utils/logger';
import { createProgressBarString } from 'utils/progress-bar';
import { appsUrlBuilder } from 'utils/urls-builder';

export const getSignedStorageUrl = async (appVersionId: number): Promise<string> => {
  const DEBUG_TAG = 'get_signed_storage_url';
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
  } catch (error: any | HttpError) {
    logger.debug(error, DEBUG_TAG);
    if (error instanceof HttpError) {
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
  } catch (error_: any | HttpError) {
    const error = error_ instanceof HttpError ? error_ : new Error('Failed to check app version deployment status.');
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
        DeploymentStatusTypesSchema['deploying-app'],
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
  const DEBUG_TAG = 'upload_file_to_storage';
  try {
    const response = await axios.put(cloudStorageUrl, fileData, {
      headers: { 'Content-Type': fileType },
    });
    return response;
  } catch (error: any) {
    logger.debug(error, DEBUG_TAG);
    throw new Error('Failed in uploading the project.');
  }
};

export const buildAssetToDeployTask = async (
  ctx: PushCommandTasksContext,
  task: ListrTaskWrapper<PushCommandTasksContext, any>,
) => {
  const DEBUG_TAG = 'build_asset_to_deploy_task';
  try {
    if (!ctx.directoryPath) {
      const currentDirectoryPath = getCurrentWorkingDirectory();
      logger.debug(`Directory path not provided using current directory: ${currentDirectoryPath}`);
      ctx.directoryPath = currentDirectoryPath;
    }

    task.output = `Building asset to deploy from "${ctx.directoryPath}" directory`;
    const archivePath = await createTarGzArchive(ctx.directoryPath, 'code');
    ctx.archivePath = archivePath;
    ctx.showPrepareEnvironmentTask = true;
  } catch (error) {
    logger.debug(error, DEBUG_TAG);
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

const MAX_PROGRESS_VALUE = 100;
const PROGRESS_STEP = Math.round(MAX_PROGRESS_VALUE / 100);

const STATUS_TO_PROGRESS_VALUE: Record<keyof typeof DeploymentStatusTypesSchema, number> = {
  [DeploymentStatusTypesSchema.failed]: 0,
  [DeploymentStatusTypesSchema.started]: 0,
  [DeploymentStatusTypesSchema.pending]: PROGRESS_STEP * 5,
  [DeploymentStatusTypesSchema.building]: PROGRESS_STEP * 10,
  [DeploymentStatusTypesSchema['building-infra']]: PROGRESS_STEP * 25,
  [DeploymentStatusTypesSchema['building-app']]: PROGRESS_STEP * 50,
  [DeploymentStatusTypesSchema['deploying-app']]: PROGRESS_STEP * 75,
  [DeploymentStatusTypesSchema.successful]: PROGRESS_STEP * 100,
};

const finalizeDeployment = (
  deploymentStatus: AppVersionDeploymentStatus,
  task: ListrTaskWrapper<PushCommandTasksContext, any>,
) => {
  switch (deploymentStatus.status) {
    case DeploymentStatusTypesSchema.failed: {
      task.title = deploymentStatus.error?.message || 'Deployment process has failed';
      throw new Error(task.title);
    }

    case DeploymentStatusTypesSchema.successful: {
      const deploymentUrl = `Deployment successfully finished, deployment url: ${deploymentStatus.deployment!.url}`;
      task.title = deploymentUrl;
      break;
    }

    default: {
      const generalErrorMessage = 'Something went wrong, the deployment url is missing.';
      task.title = generalErrorMessage;
      throw new Error(generalErrorMessage);
    }
  }
};

export const handleDeploymentTask = async (
  ctx: PushCommandTasksContext,
  task: ListrTaskWrapper<PushCommandTasksContext, any>,
) => {
  task.output = createProgressBarString(MAX_PROGRESS_VALUE, 0);
  const now = Date.now();
  const retryAfter = TimeInMs.second * 5;
  const ttl = TimeInMs.minute * 30;
  const deploymentStatus = await pollForDeploymentStatus(ctx.appVersionId, retryAfter, {
    ttl,
    progressLogger: (message: keyof typeof DeploymentStatusTypesSchema) => {
      const deltaInSeconds = (Date.now() - now) / TimeInMs.second;
      task.title = `Deployment in progress: ${message}`;
      task.output = createProgressBarString(MAX_PROGRESS_VALUE, STATUS_TO_PROGRESS_VALUE[message], deltaInSeconds);
    },
  });

  finalizeDeployment(deploymentStatus, task);
};
