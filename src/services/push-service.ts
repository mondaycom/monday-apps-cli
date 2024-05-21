import axios from 'axios';
import chalk from 'chalk';
import { StatusCodes } from 'http-status-codes';
import { ListrTaskWrapper } from 'listr2';

import { getAppVersionDeploymentStatusUrl, getDeploymentClientUpload, getDeploymentSignedUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { getCurrentWorkingDirectory } from 'services/env-service';
import {
  compressBuildToZip,
  createTarGzArchive,
  readFileData,
  readZipFileAsBuffer,
  validateIfCanBuild,
  verifyClientDirectory,
} from 'services/files-service';
import { pollPromise } from 'services/polling-service';
import { appVersionDeploymentStatusSchema, signedUrlSchema } from 'services/schemas/push-service-schemas';
import { PushCommandTasksContext } from 'types/commands/push';
import { HttpError } from 'types/errors';
import { Region } from 'types/general/region';
import { TimeInMs } from 'types/general/time';
import { HttpMethodTypes } from 'types/services/api-service';
import {
  AppVersionDeploymentStatus,
  DeploymentStatusTypesSchema,
  SignedUrl,
  uploadClient,
} from 'types/services/push-service';
import logger from 'utils/logger';
import { createProgressBarString } from 'utils/progress-bar';
import { queryBuilderAddRegion } from 'utils/region';
import { appsUrlBuilder } from 'utils/urls-builder';

export const getSignedStorageUrl = async (appVersionId: number, region?: Region): Promise<string> => {
  const DEBUG_TAG = 'get_signed_storage_url';
  try {
    const baseSignUrl = getDeploymentSignedUrl(appVersionId);
    const url = appsUrlBuilder(baseSignUrl);
    const query = queryBuilderAddRegion({}, region);

    const response = await execute<SignedUrl>(
      {
        query,
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

export const uploadClientZipFile = async (appVersionId: number, buffer: Buffer) => {
  const baseUrl = getDeploymentClientUpload(appVersionId);
  const url = appsUrlBuilder(baseUrl);
  const formData = new FormData();
  formData.append('zipfile', new Blob([buffer]));
  const response = await execute<uploadClient>({
    url,
    headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' },
    method: HttpMethodTypes.POST,
    body: formData,
  });
  return response.data;
};

export const getAppVersionDeploymentStatus = async (appVersionId: number, region?: Region) => {
  try {
    const baseAppVersionIdStatusUrl = getAppVersionDeploymentStatusUrl(appVersionId);
    const url = appsUrlBuilder(baseAppVersionIdStatusUrl);
    const query = queryBuilderAddRegion({}, region);

    const response = await execute<AppVersionDeploymentStatus>(
      {
        query,
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
  region?: Region,
  options: {
    ttl?: number;
    progressLogger?: (message: keyof typeof DeploymentStatusTypesSchema, tip?: string) => void;
  } = {},
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
      const response = await getAppVersionDeploymentStatus(appVersionId, region);
      if (statusesToKeepPolling.includes(response.status)) {
        if (progressLogger) {
          progressLogger(response.status, response.tip);
        }

        return false;
      }

      return true;
    },
    retryAfter,
    ttl || retryAfter * 60,
  );
  const response = await getAppVersionDeploymentStatus(appVersionId, region);
  return response;
};

export const uploadFileToStorage = async (
  cloudStorageUrl: string,
  fileData: Buffer,
  fileType: string,
): Promise<any> => {
  const DEBUG_TAG = 'upload_file_to_storage';
  try {
    const response = await axios.request({
      method: 'put',
      url: cloudStorageUrl,
      data: fileData,
      headers: { 'Content-Type': fileType },
    });
    return response;
  } catch (error: any) {
    logger.debug(error, DEBUG_TAG);
    throw new Error('Failed in uploading the project.');
  }
};

export const buildClientZip = async (
  ctx: PushCommandTasksContext,
  task: ListrTaskWrapper<PushCommandTasksContext, any>,
) => {
  if (!ctx.directoryPath) {
    const currentDirectoryPath = getCurrentWorkingDirectory();
    logger.debug(`Directory path not provided. using current directory: ${currentDirectoryPath}`);
    ctx.directoryPath = currentDirectoryPath;
  }

  task.output = `Building client zip from "${ctx.directoryPath}" directory`;
  verifyClientDirectory(ctx.directoryPath);
  ctx.archivePath = await compressBuildToZip(ctx.directoryPath);
};

export const deployClientZip = async (
  ctx: PushCommandTasksContext,
  task: ListrTaskWrapper<PushCommandTasksContext, any>,
) => {
  task.output = `Deploying client zip (${ctx.archivePath!}) to cdn`;
  const buffer = readZipFileAsBuffer(ctx.archivePath!);
  const data = await uploadClientZipFile(ctx.appVersionId, buffer);
  task.title = `your project is live at: ${data.url}, use ${data.sourceUrl} for download your source`;
};

export const buildAssetToDeployTask = async (
  ctx: PushCommandTasksContext,
  task: ListrTaskWrapper<PushCommandTasksContext, any>,
) => {
  const DEBUG_TAG = 'build_asset_to_deploy_task';
  try {
    if (!ctx.directoryPath) {
      const currentDirectoryPath = getCurrentWorkingDirectory();
      logger.debug(`Directory path not provided. using current directory: ${currentDirectoryPath}`);
      ctx.directoryPath = currentDirectoryPath;
    }

    task.output = `Building asset to deploy from "${ctx.directoryPath}" directory`;
    validateIfCanBuild(ctx.directoryPath);
    const archivePath = await createTarGzArchive(ctx.directoryPath, 'code');
    ctx.archivePath = archivePath;
    ctx.showPrepareEnvironmentTask = true;
  } catch (error) {
    logger.debug(error, DEBUG_TAG);
    throw error;
  }
};

export const prepareEnvironmentTask = async (ctx: PushCommandTasksContext) => {
  try {
    const signedCloudStorageUrl = await getSignedStorageUrl(ctx.appVersionId, ctx.region);
    const archiveContent = readFileData(ctx.archivePath!);
    ctx.signedCloudStorageUrl = signedCloudStorageUrl;
    ctx.archiveContent = archiveContent;
    ctx.showUploadAssetTask = true;
  } catch (error: any | HttpError) {
    if (error instanceof HttpError && error.code === StatusCodes.CONFLICT) {
      const msg = `This deployment could not start, as there is already an existing deployment in progress for app version ${ctx.appVersionId}.
   - Run the command "code:status -v ${ctx.appVersionId}" to check the existing deployment status.
   - It might take a few minutes to complete, or if enough time passes so it will fail, you can try a new deployment with "code:push".`;
      throw new Error(msg);
    }

    throw error;
  }
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

const setCustomTip = (tip?: string, color = 'green') => {
  let chalkColor = chalk.green;
  switch (color) {
    case 'yellow': {
      chalkColor = chalk.yellow;
      break;
    }
  }

  return tip ? `\n ${chalk.italic(chalkColor(tip))}` : '';
};

const finalizeDeployment = (
  deploymentStatus: AppVersionDeploymentStatus,
  task: ListrTaskWrapper<PushCommandTasksContext, any>,
) => {
  switch (deploymentStatus.status) {
    case DeploymentStatusTypesSchema.failed: {
      const customTip = setCustomTip(deploymentStatus.tip, 'yellow');
      task.title = (deploymentStatus.error?.message.trimStart() || 'Deployment process has failed') + customTip;
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
  const deploymentStatus = await pollForDeploymentStatus(ctx.appVersionId, retryAfter, ctx.region, {
    ttl,
    progressLogger: (message: keyof typeof DeploymentStatusTypesSchema, tip?: string) => {
      const deltaInSeconds = (Date.now() - now) / TimeInMs.second;
      task.title = `Deployment in progress: ${message}`;
      const customTip = setCustomTip(tip);
      task.output =
        createProgressBarString(MAX_PROGRESS_VALUE, STATUS_TO_PROGRESS_VALUE[message], deltaInSeconds) + customTip;
    },
  });

  finalizeDeployment(deploymentStatus, task);
};
