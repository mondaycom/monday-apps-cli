import { createAppUrl, listAppsUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { createAppSchema, listAppSchema } from 'services/schemas/apps-service-schemas';
import { HttpError } from 'types/errors';
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

export const createApp = async (body?: { name?: string }): Promise<App> => {
  try {
    const path = createAppUrl();
    const url = appsUrlBuilder(path);
    const response = await execute<CreateAppResponse>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.POST,
        body,
      },
      createAppSchema,
    );

    return response.app;
  } catch (error: any) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('Failed to create app.');
  }
};
