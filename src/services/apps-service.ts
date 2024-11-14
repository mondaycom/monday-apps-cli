import { ListrTaskWrapper } from 'listr2';

import { createAppUrl, listAppsUrl, removeAppStorageDataForAccountUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { createAppFeatureWithRelease } from 'services/app-features-service';
import { defaultVersionByAppId } from 'services/app-versions-service';
import { cloneFolderFromGitRepo } from 'services/git-service';
import { buildTypeManifestFormatMap, readManifestFile } from 'services/manifest-service';
import { baseResponseHttpMetaDataSchema } from 'services/schemas/api-service-schemas';
import { createAppSchema, listAppSchema } from 'services/schemas/apps-service-schemas';
import { getTunnelingDomain } from 'services/tunnel-service';
import { AppCreateCommandTasksContext } from 'types/commands/app-create';
import { HttpError } from 'types/errors';
import { AccountId, AppId } from 'types/general';
import { HttpMethodTypes } from 'types/services/api-service';
import { App, CreateAppResponse, ListAppResponse } from 'types/services/apps-service';
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
  const defaultVersion = await defaultVersionByAppId(ctx.appId!);
  const baseUrl = await getTunnelingDomain();
  if (!defaultVersion) throw new Error(`No default version found for app id - ${ctx.appId}`);
  ctx.appVersionId = defaultVersion.id;
  const createFeaturesPromises =
    ctx.features?.map(feature => {
      return createAppFeatureWithRelease({
        appId: ctx.appId!,
        appVersionId: defaultVersion.id,
        appFeatureType: feature.type,
        build: feature.build && {
          buildType: buildTypeManifestFormatMap[feature.build.source],
          url: `https://${baseUrl}${feature.build.suffix}`,
        },
        options: { name: feature.name },
      });
    }) || [];

  await Promise.all(createFeaturesPromises);
};

export const checkIfAppSupportMultiRegion = async (appId: number): Promise<boolean> => {
  const apps = await listApps();
  const app = apps.find(app => app.id === appId);
  if (!app) throw new Error(`App with id ${appId} not found.`);
  return Boolean(app.mondayCodeConfig?.isMultiRegion);
};

export const removeAppStorageDataForAccount = async (appId: AppId, targetAccountId: AccountId): Promise<void> => {
  try {
    const path = removeAppStorageDataForAccountUrl(appId, targetAccountId);
    const url = appsUrlBuilder(path);
    await execute(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.DELETE,
        timeout: 60 * 1000,
      },
      baseResponseHttpMetaDataSchema,
    );
  } catch (error: any) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('Failed to remove app storage data for account.');
  }
};
