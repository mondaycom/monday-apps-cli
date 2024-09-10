import { StatusCodes } from 'http-status-codes';

import { APP_VARIABLE_MANAGEMENT_MODES } from 'consts/manage-app-variables';
import { appEnvironmentKeysUrl, appEnvironmentUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { listAppEnvironmentKeysResponseSchema } from 'services/schemas/manage-app-env-service-schemas';
import { HttpError } from 'types/errors';
import { AppId } from 'types/general';
import { Region } from 'types/general/region';
import { HttpMethodTypes } from 'types/services/api-service';
import { ListAppEnvironmentKeysResponse } from 'types/services/manage-app-env-service';
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

export const listAppEnvKeys = async (appId: AppId, region?: Region): Promise<Array<string>> => {
  try {
    const path = appEnvironmentKeysUrl(appId);
    const url = appsUrlBuilder(path);
    const query = addRegionToQuery({}, region);

    const response = await execute<ListAppEnvironmentKeysResponse>(
      {
        query,
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.GET,
      },
      listAppEnvironmentKeysResponseSchema,
    );

    return response.keys;
  } catch (error: any) {
    if (error instanceof HttpError) {
      handleHttpErrors(error);
    }

    throw new Error('failed to list app environment keys');
  }
};

export const setEnv = async (appId: AppId, key: string, value: string, region?: Region) => {
  try {
    const path = appEnvironmentUrl(appId, key);
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

    throw new Error('failed to set environment variable');
  }
};

export const deleteEnv = async (appId: AppId, key: string, region?: Region) => {
  try {
    const path = appEnvironmentUrl(appId, key);
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

    throw new Error('failed to delete environment variable');
  }
};

const handleEnvironmentSet = async (appId: AppId, region: Region | undefined, key: string, value: string) => {
  if (!key || !value) {
    throw new Error('key and value are required');
  }

  await setEnv(appId, key, value, region);
  logger.info(`Environment variable connected to key: "${key}", was set`);
};

const handleEnvironmentDelete = async (appId: AppId, region: Region | undefined, key: string) => {
  if (!key) {
    throw new Error('key is required');
  }

  await deleteEnv(appId, key, region);
  logger.info(`Environment variable connected to key: "${key}", was deleted`);
};

const handleEnvironmentListKeys = async (appId: AppId, region: Region | undefined) => {
  const response = await listAppEnvKeys(appId, region);
  if (response?.length === 0) {
    logger.info('No environment variables found');
    return;
  }

  logger.info('App environment variable keys:');
  logger.table(response.map(key => ({ keys: key })));
};

const MAP_MODE_TO_HANDLER: Record<
  APP_VARIABLE_MANAGEMENT_MODES,
  (appId: AppId, region: Region | undefined, key: string, value: string) => Promise<void>
> = {
  [APP_VARIABLE_MANAGEMENT_MODES.SET]: handleEnvironmentSet,
  [APP_VARIABLE_MANAGEMENT_MODES.DELETE]: handleEnvironmentDelete,
  [APP_VARIABLE_MANAGEMENT_MODES.LIST_KEYS]: handleEnvironmentListKeys,
};

export const handleEnvironmentRequest = async (
  appId: AppId,
  mode: APP_VARIABLE_MANAGEMENT_MODES,
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
