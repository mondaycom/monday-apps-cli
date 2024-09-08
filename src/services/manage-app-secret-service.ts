import { StatusCodes } from 'http-status-codes';

import { APP_SECRET_MANAGEMENT_MODES } from 'consts/manage-app-secret';
import { appSecretKeysUrl, appSecretUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { listAppSecretKeysResponseSchema } from 'services/schemas/manage-app-secret-service-schemas';
import { HttpError } from 'types/errors';
import { AppId } from 'types/general';
import { Region } from 'types/general/region';
import { HttpMethodTypes } from 'types/services/api-service';
import { ListAppSecretKeysResponse } from 'types/services/manage-app-secret-service';
import logger from 'utils/logger';
import { addRegionToQuery } from 'utils/region';
import { appsUrlBuilder } from 'utils/urls-builder';

const handleHttpErrors = (error: HttpError) => {
  switch (error.code) {
    case StatusCodes.NOT_FOUND: {
      throw new Error('monday-code deployment not found for the requested app');
    }

    case StatusCodes.FORBIDDEN: {
      throw new Error('You are not authorized to access the requested app');
    }

    default: {
      throw error;
    }
  }
};

export const listAppSecretKeys = async (appId: AppId, region?: Region): Promise<Array<string>> => {
  try {
    const path = appSecretKeysUrl(appId);
    const url = appsUrlBuilder(path);
    const query = addRegionToQuery({}, region);

    const response = await execute<ListAppSecretKeysResponse>(
      {
        query,
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.GET,
      },
      listAppSecretKeysResponseSchema,
    );

    return response.keys;
  } catch (error: any) {
    if (error instanceof HttpError) {
      handleHttpErrors(error);
    }

    throw new Error('failed to list app secret keys');
  }
};

export const setSecret = async (appId: AppId, key: string, value: string, region?: Region) => {
  try {
    const path = appSecretUrl(appId, key);
    const url = appsUrlBuilder(path);
    const query = addRegionToQuery({}, region);
    await execute({
      query,
      url,
      headers: { Accept: 'application/json' },
      method: HttpMethodTypes.PUT,
      body: { value },
    });
  } catch (error: any) {
    if (error instanceof HttpError) {
      handleHttpErrors(error);
    }

    throw new Error('failed to set secret variable');
  }
};

export const deleteSecret = async (appId: AppId, key: string, region?: Region) => {
  try {
    const path = appSecretUrl(appId, key);
    const url = appsUrlBuilder(path);
    const query = addRegionToQuery({}, region);

    await execute({
      query,
      url,
      headers: { Accept: 'application/json' },
      method: HttpMethodTypes.DELETE,
    });

    return true;
  } catch (error: any) {
    if (error instanceof HttpError) {
      handleHttpErrors(error);
    }

    throw new Error('failed to delete secret variable');
  }
};

const handleSecretSet = async (appId: AppId, region: Region | undefined, key: string, value: string) => {
  if (!key || !value) {
    throw new Error('key and value are required');
  }

  await setSecret(appId, key, value, region);
  logger.info(`Secret variable connected to key: "${key}", was set`);
};

const handleSecretDelete = async (appId: AppId, region: Region | undefined, key: string) => {
  if (!key) {
    throw new Error('key is required');
  }

  await deleteSecret(appId, key, region);
  logger.info(`Secret variable connected to key: "${key}", was deleted`);
};

const handleSecretListKeys = async (appId: AppId, region: Region | undefined) => {
  const response = await listAppSecretKeys(appId, region);
  if (response?.length === 0) {
    logger.info('No secret variables found');
    return;
  }

  logger.info('App secret variable keys:');
  logger.table(response.map(key => ({ keys: key })));
};

const MAP_MODE_TO_HANDLER: Record<
  APP_SECRET_MANAGEMENT_MODES,
  (appId: AppId, region: Region | undefined, key: string, value: string) => Promise<void>
> = {
  [APP_SECRET_MANAGEMENT_MODES.SET]: handleSecretSet,
  [APP_SECRET_MANAGEMENT_MODES.DELETE]: handleSecretDelete,
  [APP_SECRET_MANAGEMENT_MODES.LIST_KEYS]: handleSecretListKeys,
};

export const handleSecretRequest = async (
  appId: AppId,
  mode: APP_SECRET_MANAGEMENT_MODES,
  key?: string,
  value?: string,
  region?: Region,
) => {
  if (!appId || !mode) {
    throw new Error('appId and mode are required');
  }

  const modeHandler = MAP_MODE_TO_HANDLER[mode];
  if (!modeHandler) {
    throw new Error('invalid mode');
  }

  await modeHandler(appId, region, key!, value!);
};
