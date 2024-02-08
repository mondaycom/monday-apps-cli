import { ListrTaskWrapper } from 'listr2';

import { createAppUrl, listAppsUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { createAppFeatureWithRelease } from 'services/app-features-service';
import { defaultVersionByAppId } from 'services/app-versions-service';
import { getMondayDomain } from 'services/env-service';
import { cloneFolderFromGitRepo } from 'services/git-service';
import { readManifestFile } from 'services/manifest-service';
import { createAppSchema, listAppSchema } from 'services/schemas/apps-service-schemas';
import { AppCreateCommandTasksContext } from 'types/commands/app-create';
import { HttpError } from 'types/errors';
import { HttpMethodTypes } from 'types/services/api-service';
import { App, CreateAppResponse, ListAppResponse } from 'types/services/apps-service';
import logger from 'utils/logger';
import { appsUrlBuilder } from 'utils/urls-builder';

export const listApps = async (): Promise<Array<App>> => {
  try {
    const path = listAppsUrl();
    const url = appsUrlBuilder(path);
    const response = await execute<ListAppResponse>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.GET,
      },
      listAppSchema,
    );
    const sortedApps = response.apps?.sort((a, b) => b.id - a.id);
    return sortedApps;
  } catch (error: any) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('Failed to list apps.');
  }
};

export const createApp = async (ctx: AppCreateCommandTasksContext): Promise<void> => {
  try {
    const path = createAppUrl();
    const url = appsUrlBuilder(path);
    const response = await execute<CreateAppResponse>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.POST,
        body: ctx.appName ? { name: ctx.appName } : undefined,
      },
      createAppSchema,
    );

    ctx.appId = response.app.id;
    ctx.appName = response.app.name;
  } catch (error: any) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('Failed to create app.');
  }
};

export const cloneAppTemplateAndLoadManifest = async (
  ctx: AppCreateCommandTasksContext,
  task: ListrTaskWrapper<AppCreateCommandTasksContext, any>,
) => {
  const output = (data: string) => {
    task.output = data;
  };

  await cloneFolderFromGitRepo(ctx.githubUrl, ctx.folder, ctx.branch, ctx.targetPath, output);
  const manifestData = readManifestFile(ctx.targetPath);
  ctx.appName = ctx.appName || manifestData.app.name;
  ctx.features = manifestData.app.features;
};

export const createFeatures = async (ctx: AppCreateCommandTasksContext) => {
  const defaultVersion = await defaultVersionByAppId(ctx.appId!, false);
  if (!defaultVersion) throw new Error(`No default version found for app id - ${ctx.appId}`);
  ctx.appVersionId = defaultVersion.id;
  const createFeaturesPromises = ctx.features?.map(feature => {
    return createAppFeatureWithRelease({
      appId: ctx.appId!,
      appVersionId: defaultVersion.id,
      appFeatureType: feature.type,
      build: feature.build && {
        buildType: feature.build.source,
        url: `https://baseUrl${feature.build.sufix}`,
      },
      options: { name: feature.name },
    });
  });

  await Promise.all(createFeaturesPromises || []);
};

export const finishCreateApp = (ctx: AppCreateCommandTasksContext) => {
  logger.success(`Your app is ready`);
  logger.success(`'cd ./${ctx.targetPath}' to see your app files.`);
  logger.success(
    `open in browser: ${getMondayDomain()}/apps/manage/${ctx.appId}/app_versions/${
      ctx.appVersionId
    }/sections/appDetails to manage your app.`,
  );
};
