import { ListrTaskWrapper } from 'listr2';

import { createAppFromManifestUrl, updateAppFromManifestUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { compressFilesToZip, readZipFileAsBuffer } from 'services/files-service';
import { PromptService } from 'services/prompt-service';
import { ImportCommandTasksContext } from 'types/commands/manifest-import';
import { AppId, AppVersionId } from 'types/general';
import { HttpMethodTypes } from 'types/services/api-service';
import { loadFile, saveToFile, unlink } from 'utils/file-system';
import logger from 'utils/logger';
import { processTemplate } from 'utils/templating';
import { TIME_IN_MILLISECONDS } from 'utils/time-utils';
import { appsUrlBuilder } from 'utils/urls-builder';

export const uploadManifestTsk = async (
  ctx: ImportCommandTasksContext,
  task: ListrTaskWrapper<ImportCommandTasksContext, any>,
) => {
  const processedManifest = await processManifestTemplate(ctx.manifestFilePath);
  ctx.manifestFilePath = `${ctx.manifestFilePath}.processed`;

  try {
    await saveToFile(ctx.manifestFilePath, JSON.stringify(processedManifest));

    task.output = `Zipping your manifest file`;
    const zipFilePath = await compressFilesToZip([{ path: ctx.manifestFilePath, replaceName: 'manifest.json' }]);
    const buffer = readZipFileAsBuffer(zipFilePath);
    task.output = `Uploading your app manifest`;
    await uploadZippedManifest(buffer, { appId: ctx.appId, appVersionId: ctx.appVersionId });
    task.output = `your app manifest has been uploaded successfully`;
  } finally {
    await unlink(ctx.manifestFilePath);
  }
};

export const processManifestTemplate = async (manifestFilePath: string) => {
  try {
    const manifestJson = await loadFile(manifestFilePath);
    const parsedManifest = JSON.parse(manifestJson) as Record<string, any>;

    const processedManifest = processTemplate(parsedManifest, process.env, {
      failOnMissingVariable: true,
    });
    return processedManifest;
  } catch (error) {
    logger.debug(error);

    if (error instanceof SyntaxError) {
      throw new TypeError(
        `Failed to parse manifest file. Please verify that "${manifestFilePath}" contains valid JSON.`,
      );
    }

    if (error instanceof Error && error.message.includes('Missing variable')) {
      throw new Error(
        `Failed to process manifest template: ${error.message}. Please ensure all required environment variables are set.`,
      );
    }

    throw new Error(
      `Failed to process manifest file "${manifestFilePath}". ${error instanceof Error ? error.message : ''}`,
    );
  }
};

export const shouldCreateNewApp = async (flags: { appId?: AppId; appVersionId?: AppVersionId; newApp?: boolean }) => {
  if (flags.newApp || flags.appId || flags.appVersionId) {
    return true;
  }

  const CREATE_NEW_APP = 'Create new app';
  const IMPORT_TO_EXISTING_APP = 'Import to override an existing app';
  const userChoice = await PromptService.promptList(
    'How do you want to import your app',
    [IMPORT_TO_EXISTING_APP, CREATE_NEW_APP],
    IMPORT_TO_EXISTING_APP,
  );
  return userChoice === CREATE_NEW_APP;
};

export const shouldCreateNewAppVersion = async (flags: {
  appId?: AppId;
  appVersionId?: AppVersionId;
  newApp?: boolean;
}) => {
  if (flags.appVersionId || flags.newApp) {
    return false;
  }

  const CREATE_NEW_VERSION = 'Create a new version';
  const OVERRIDE_EXISTING_VERSION = 'Override an existing version';
  const userChoice = await PromptService.promptList(
    'How do you want to import your app',
    [OVERRIDE_EXISTING_VERSION, CREATE_NEW_VERSION],
    OVERRIDE_EXISTING_VERSION,
  );
  return userChoice === CREATE_NEW_VERSION;
};

export const uploadZippedManifest = async (
  buffer: Buffer,
  options?: { appId?: AppId; appVersionId?: AppVersionId },
) => {
  const { appId, appVersionId } = options || {};

  if (appId) {
    return updateAppFromManifest(buffer, appId, appVersionId);
  }

  return createAppFromManifest(buffer);
};

const updateAppFromManifest = async (buffer: Buffer, appId: AppId, appVersionId?: AppVersionId) => {
  const baseUrl = updateAppFromManifestUrl(appId);
  const url = appsUrlBuilder(baseUrl);
  const formData = new FormData();
  formData.append('zipfile', new Blob([buffer]));

  const response = await execute({
    url,
    headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' },
    method: HttpMethodTypes.PUT,
    body: formData,
    query: { ...(appVersionId && { appVersionId }) },
    timeout: TIME_IN_MILLISECONDS.SECOND * 30,
  });
  return response;
};

const createAppFromManifest = async (buffer: Buffer) => {
  const baseUrl = createAppFromManifestUrl();
  const url = appsUrlBuilder(baseUrl);
  const formData = new FormData();
  formData.append('zipfile', new Blob([buffer]));

  const response = await execute({
    url,
    headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' },
    method: HttpMethodTypes.POST,
    body: formData,
    timeout: TIME_IN_MILLISECONDS.SECOND * 30,
  });
  return response;
};
