import { appReleasesUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { AppRelease, AppReleasesResponse, appReleasesSchema } from 'services/schemas/app-releases-schema';
import { AppReleaseCategory } from 'src/consts/app-release';
import { HttpError } from 'types/errors';
import { AppVersionId } from 'types/general';
import { HttpMethodTypes } from 'types/services/api-service';
import { appsUrlBuilder } from 'utils/urls-builder';

export const listAppBuilds = async (appVersionId: AppVersionId): Promise<Array<AppRelease>> => {
  try {
    const path = appReleasesUrl(appVersionId);
    const url = appsUrlBuilder(path);
    const response = await execute<AppReleasesResponse>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.GET,
      },
      appReleasesSchema,
    );
    return response.appReleases;
  } catch (error: any) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('Failed to list app versions.');
  }
};

export const getMondayCodeBuild = async (appVersionId: AppVersionId): Promise<AppRelease | undefined> => {
  const appReleases = await listAppBuilds(appVersionId);
  return appReleases.find(release => release.category === AppReleaseCategory.MondayCode);
};
