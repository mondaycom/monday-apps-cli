import fs from 'node:fs';
import path from 'node:path';

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
import { addRegionToQuery } from 'utils/region';
import { appsUrlBuilder } from 'utils/urls-builder';

const MAX_FILE_SIZE_MB = 75;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_RECURSION_DEPTH = 10;

export const getSignedStorageUrl = async (
  appVersionId: number,
  region?: Region,
  securityScan?: boolean,
): Promise<string> => {
  const DEBUG_TAG = 'get_signed_storage_url';
  try {
    const baseSignUrl = getDeploymentSignedUrl(appVersionId);
    const url = appsUrlBuilder(baseSignUrl);
    let query = addRegionToQuery({}, region);
    if (securityScan) {
      query = { ...query, securityScan: true };
    }

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

const CLIENT_ZIP_UPLOAD_TIMEOUT = 60 * 1000;

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
    timeout: CLIENT_ZIP_UPLOAD_TIMEOUT,
  });
  return response.data.data;
};

export const getAppVersionDeploymentStatus = async (appVersionId: number, region?: Region) => {
  try {
    const baseAppVersionIdStatusUrl = getAppVersionDeploymentStatusUrl(appVersionId);
    const url = appsUrlBuilder(baseAppVersionIdStatusUrl);
    const query = addRegionToQuery({}, region);

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
        DeploymentStatusTypesSchema['security-scan'],
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

const checkFileSizesInDirectory = (directoryPath: string): void => {
  const checkDirectory = (dir: string, depth = 0) => {
    if (depth > MAX_RECURSION_DEPTH) {
      const relativePath = path.relative(directoryPath, dir);
      throw new Error(
        `Directory structure is too deep!\n\n` +
          `Maximum directory depth: ${MAX_RECURSION_DEPTH} levels\n` +
          `Reached at: ${relativePath || '.'}\n\n` +
          `Please flatten your project structure or move deeply nested directories outside your deployment folder.`,
      );
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        checkDirectory(fullPath, depth + 1);
      } else if (stats.isFile() && stats.size > MAX_FILE_SIZE_BYTES) {
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        const relativePath = path.relative(directoryPath, fullPath);
        throw new Error(
          `File size limit exceeded!\n\n` +
            `File: ${relativePath}\n` +
            `Size: ${fileSizeMB}MB\n` +
            `Maximum allowed: ${MAX_FILE_SIZE_MB}MB\n\n` +
            `The file "${relativePath}" is too large to deploy.\n\n` +
            `Please reduce the file size`,
        );
      }
    }
  };

  checkDirectory(directoryPath);
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
  checkFileSizesInDirectory(ctx.directoryPath);
  ctx.archivePath = await compressBuildToZip(ctx.directoryPath);
};

export const deployClientZip = async (
  ctx: PushCommandTasksContext,
  task: ListrTaskWrapper<PushCommandTasksContext, any>,
) => {
  task.output = `Deploying client zip (${ctx.archivePath!}) to cdn`;
  const buffer = readZipFileAsBuffer(ctx.archivePath!);
  const data = await uploadClientZipFile(ctx.appVersionId, buffer);
  task.title = `Your project is live at: ${data.url}\n You can download your source code here: ${data.sourceUrl}`;
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
    const signedCloudStorageUrl = await getSignedStorageUrl(ctx.appVersionId, ctx.region, ctx.securityScan);
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
  [DeploymentStatusTypesSchema['security-scan']]: PROGRESS_STEP * 60,
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

const writeSecurityScanResultsToDisk = (securityScanResults: any, appVersionId: number): string => {
  const timestamp = new Date().toISOString().split('.')[0].replaceAll(':', '-');
  const fileName = `security-scan-${appVersionId}-${timestamp}.json`;
  const filePath = path.join(process.cwd(), fileName);

  fs.writeFileSync(filePath, JSON.stringify(securityScanResults, null, 2), 'utf8');

  return filePath;
};

const finalizeDeployment = (
  deploymentStatus: AppVersionDeploymentStatus,
  task: ListrTaskWrapper<PushCommandTasksContext, any>,
  ctx: PushCommandTasksContext,
) => {
  switch (deploymentStatus.status) {
    case DeploymentStatusTypesSchema.failed: {
      const customTip = setCustomTip(deploymentStatus.tip, 'yellow');
      task.title = (deploymentStatus.error?.message.trimStart() || 'Deployment process has failed') + customTip;
      throw new Error(task.title);
    }

    case DeploymentStatusTypesSchema.successful: {
      let deploymentUrl = `Deployment successfully finished, deployment url: ${deploymentStatus.deployment!.url}`;

      if (deploymentStatus.securityScanResults) {
        const scanResultsPath = writeSecurityScanResultsToDisk(deploymentStatus.securityScanResults, ctx.appVersionId);
        ctx.securityScanResultsPath = scanResultsPath;

        const summary = deploymentStatus.securityScanResults.summary;
        const errors = chalk.red(`✖ ${summary.error} errors`);
        const warnings = chalk.yellow(`▲ ${summary.warning} warnings`);
        const notes = chalk.cyan(`ℹ ${summary.note} info`);
        const scanSummary = `\nSecurity scan completed with ${summary.total} findings:\n${errors}\t${warnings}\t${notes}`;
        const downloadLink = `\nResults saved to: ${scanResultsPath}`;

        deploymentUrl += scanSummary + downloadLink;
      }

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

  finalizeDeployment(deploymentStatus, task, ctx);
};
