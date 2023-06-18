import { listAppVersionsByAppIdUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { listAppVersionsSchema } from 'services/schemas/app-versions-schemas';
import { HttpError } from 'types/errors';
import { AppId } from 'types/general';
import { HttpMethodTypes } from 'types/services/api-service';
import { AppVersion, ListAppVersionsResponse } from 'types/services/app-versions-service';
import logger from 'utils/logger';
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
    return response.appVersions;
  } catch (error: any) {
    logger.debug(error);
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('Failed to list app versions.');
  }
};
