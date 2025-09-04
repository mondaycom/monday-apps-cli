import { ListrTaskWrapper } from 'listr2';

import { exportAppManifestUrl, makeAppManifestExportableUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { decompressZipBufferToFiles } from 'services/files-service';
import { HttpError } from 'src/types/errors';
import { ExportCommandTasksContext } from 'types/commands/manifest-export';
import { AppId, AppVersionId } from 'types/general';
import { HttpMethodTypes } from 'types/services/api-service';
import { appsUrlBuilder } from 'utils/urls-builder';

export const downloadManifestTask = async (
  ctx: ExportCommandTasksContext,
  task: ListrTaskWrapper<ExportCommandTasksContext, any>,
) => {
  task.output = `downloading manifest for app ${ctx.appId}`;
  const appManifest = await downloadManifest(ctx.appId, ctx.appVersionId);
  const outputPath = ctx.manifestPath || `${ctx.appId}`;
  await decompressZipBufferToFiles(Buffer.from(appManifest, 'base64'), outputPath);

  const currentWorkingDirectory = process.cwd();
  const absolutePath = outputPath.startsWith('/') ? outputPath : `${currentWorkingDirectory}/${outputPath}`;
  task.title = `your manifest files are downloaded at ${absolutePath}`;
};

export const downloadManifest = async (appId: AppId, appVersionId?: AppVersionId) => {
  const baseUrl = exportAppManifestUrl(appId);
  const url = appsUrlBuilder(baseUrl);

  const response = (await execute({
    url,
    method: HttpMethodTypes.GET,
    query: { ...(appVersionId && { appVersionId }) },
  })) as any as { data: string };

  return response.data;
};

export const validateManifestTask = async (
  ctx: ExportCommandTasksContext,
  task: ListrTaskWrapper<ExportCommandTasksContext, any>,
) => {
  task.output = `validating manifest for app ${ctx.appId}`;
  await validateManifest(ctx.appId, ctx.appVersionId);
  task.title = 'The app is valid for export';
};

export const validateManifest = async (appId: AppId, appVersionId?: AppVersionId) => {
  try {
    const baseUrl = makeAppManifestExportableUrl(appId);
    const url = appsUrlBuilder(baseUrl);

    await execute({
      url,
      method: HttpMethodTypes.POST,
      query: { ...(appVersionId && { appVersionId }) },
    });
  } catch (error) {
    if (error instanceof HttpError && error.message.includes('Cannot create slugs for live version')) {
      throw new Error(error.message);
    }
  }
};
