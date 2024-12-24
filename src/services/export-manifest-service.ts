import { ListrTaskWrapper } from 'listr2';

import { exportAppManifestUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { writeBufferToFile } from 'services/files-service';
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
  writeBufferToFile(`manifest-${ctx.appId}.zip`, Buffer.from(appManifest, 'base64'));
  task.title = `manifest saved to manifest.zip`;
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
