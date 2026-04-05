import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

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
  const userPath = ctx.manifestPath || `${ctx.appId}`;
  const isFilePath = path.extname(userPath) === '.json';
  const outputDir = isFilePath ? path.dirname(userPath) || '.' : userPath;
  const targetFile = isFilePath ? userPath : path.join(userPath, 'manifest.json');

  if (fs.existsSync(targetFile)) {
    // Clean up directories left by the previous buggy behavior that created directories instead of files
    if (fs.statSync(targetFile).isDirectory()) {
      if (!ctx.force) {
        throw new Error(
          `A directory exists at ${targetFile} (possibly from a previous export). Use --force to replace it.`,
        );
      }

      fs.rmSync(targetFile, { recursive: true, force: true });
    } else if (!ctx.force) {
      throw new Error(`File already exists: ${targetFile}. Use --force to overwrite.`);
    }
  }

  // Extract to a temp directory first to avoid overwriting existing files in the target
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mapps-manifest-'));
  try {
    await decompressZipBufferToFiles(Buffer.from(appManifest, 'base64'), tempDir);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const extractedFile = path.join(tempDir, 'manifest.json');
    fs.copyFileSync(extractedFile, targetFile);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  const currentWorkingDirectory = process.cwd();
  const absolutePath = targetFile.startsWith('/') ? targetFile : `${currentWorkingDirectory}/${targetFile}`;
  task.title = `manifest exported to ${absolutePath}`;
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
