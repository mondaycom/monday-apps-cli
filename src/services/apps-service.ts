import { listAppsUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { listAppSchema } from 'services/schemas/apps-service-schemas';
import { HttpError } from 'types/errors';
import { HttpMethodTypes } from 'types/services/api-service';
import { App, ListAppResponse } from 'types/services/apps-service';
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
    const sortedApps = response.apps?.sort((a, b) => a.id - b.id);
    return sortedApps;
  } catch (error: any) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('Failed to list apps.');
  }
};
