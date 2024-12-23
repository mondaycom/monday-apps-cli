import { ListrTaskWrapper } from 'listr2';

import { importAppManifestUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { compressFilesToZip, readZipFileAsBuffer } from 'services/files-service';
import { PromptService } from 'services/prompt-service';
import { ImportCommandTasksContext } from 'types/commands/app-import';
import { AppId, AppVersionId } from 'types/general';
import { HttpMethodTypes } from 'types/services/api-service';
import { appsUrlBuilder } from 'utils/urls-builder';

export const uploadManifestTsk = async (
  ctx: ImportCommandTasksContext,
  task: ListrTaskWrapper<ImportCommandTasksContext, any>,
) => {
  task.output = `Zipping your manifest file`;
  const zipFilePath = await compressFilesToZip([ctx.manifestFilePath]);
  const buffer = readZipFileAsBuffer(zipFilePath);
  task.output = `Uploading your app manifest`;
  await uploadZippedManifest(buffer, { appId: ctx.appId, appVersionId: ctx.appVersionId });
  task.output = `your app manifest has been uploaded successfully`;
};

export const shouldCreateNewApp = async (flags: { appId?: AppId; appVersionId?: AppVersionId; newApp?: boolean }) => {
  if (flags.newApp || flags.appId || flags.appVersionId) {
    return true;
  }

  const CREATE_NEW_APP = 'Create new app';
  const IMPORT_TO_EXISTING_APP = 'Import to existing app';
  const userChoice = await PromptService.promptList(
    'How you want to import your app',
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

  const CREATE_NEW_VERSION = 'Create new version';
  const OVERRIDE_EXISTING_VERSION = 'Override existing version';
  const userChoice = await PromptService.promptList(
    'How you want to import your app',
    [OVERRIDE_EXISTING_VERSION, CREATE_NEW_VERSION],
    OVERRIDE_EXISTING_VERSION,
  );
  return userChoice === CREATE_NEW_VERSION;
};

export const uploadZippedManifest = async (
  buffer: Buffer,
  options?: {
    appId?: AppId;
    appVersionId?: AppVersionId;
  },
) => {
  const baseUrl = importAppManifestUrl();
  const url = appsUrlBuilder(baseUrl);
  const formData = new FormData();
  formData.append('zipfile', new Blob([buffer]));

  const response = await execute({
    url,
    headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' },
    method: HttpMethodTypes.PUT,
    body: formData,
    query: {
      ...(options?.appId && { appId: options.appId }),
      ...(options?.appVersionId && { appVersionId: options.appVersionId }),
    },
  });
  return response;
};
