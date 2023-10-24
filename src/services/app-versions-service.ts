import { APP_VERSION_STATUS } from 'consts/app-versions';
import { listAppVersionsByAppIdUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { listAppVersionsSchema } from 'services/schemas/app-versions-schemas';
import { HttpError } from 'types/errors';
import { AppId } from 'types/general';
import { HttpMethodTypes } from 'types/services/api-service';
import { AppVersion, ListAppVersionsResponse } from 'types/services/app-versions-service';
import { appsUrlBuilder } from 'utils/urls-builder';

export const listAppVersionsByAppId = async (appId: AppId): Promise<Array<AppVersion>> => {
  try {
    const path = listAppVersionsByAppIdUrl(appId);
    const url = appsUrlBuilder(path);
    const response = await execute<ListAppVersionsResponse>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.GET,
      },
      listAppVersionsSchema,
    );
    const sortedAppVersions = response.appVersions?.sort((a, b) => b.id - a.id);
    return sortedAppVersions;
  } catch (error: any) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('Failed to list app versions.');
  }
};

export const defaultVersionByAppId = async (appId: AppId): Promise<AppVersion | undefined> => {
  const appVersions = await listAppVersionsByAppId(appId);
  const latestVersion = appVersions.sort((a, b) => b.id - a.id)[0];
  return latestVersion.status === APP_VERSION_STATUS.DRAFT ? latestVersion : undefined;
};
