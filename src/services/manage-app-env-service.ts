import { APP_ENV_MANAGEMENT_MODES } from 'consts/manage-app-env';
import { appEnvironmentKeysUrl, appEnvironmentUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { listAppEnvironmentKeysResponseSchema } from 'services/schemas/manage-app-env-service-schemas';
import { HttpError } from 'types/errors';
import { AppId } from 'types/general';
import { HttpMethodTypes } from 'types/services/api-service';
import { ListAppEnvironmentKeysResponse } from 'types/services/manage-app-env-service';
import logger from 'utils/logger';
import { appsUrlBuilder } from 'utils/urls-builder';

export const listAppEnvKeys = async (appId: AppId): Promise<Array<string>> => {
  const DEBUG_TAG = 'list_app_environment_keys';
  try {
    const path = appEnvironmentKeysUrl(appId);
    const url = appsUrlBuilder(path);
    const response = await execute<ListAppEnvironmentKeysResponse>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.GET,
      },
      listAppEnvironmentKeysResponseSchema,
    );

    return response.keys;
  } catch (error: any) {
    logger.debug(error, DEBUG_TAG);
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('failed to list app environment keys');
  }
};

export const setEnv = async (appId: AppId, key: string, value: string) => {
  const DEBUG_TAG = 'set_environment';
  try {
    const path = appEnvironmentUrl(appId, key);
    const url = appsUrlBuilder(path);
    await execute({
      url,
      headers: { Accept: 'application/json' },
      method: HttpMethodTypes.PUT,
      body: { value },
    });
  } catch (error: any) {
    logger.debug(error, DEBUG_TAG);
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('failed to set environment variable');
  }
};

export const deleteEnv = async (appId: AppId, key: string) => {
  const DEBUG_TAG = 'delete_environment';
  try {
    const path = appEnvironmentUrl(appId, key);
    const url = appsUrlBuilder(path);
    await execute({
      url,
      headers: { Accept: 'application/json' },
      method: HttpMethodTypes.DELETE,
    });

    return true;
  } catch (error: any) {
    logger.debug(error, DEBUG_TAG);
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('failed to delete environment variable');
  }
};

const handleEnvironmentSet = async (appId: AppId, key: string, value: string) => {
  if (!key || !value) {
    throw new Error('key and value are required');
  }

  await setEnv(appId, key, value);
  logger.info(`Environment variable connected to key: "${key}", was set`);
};

const handleEnvironmentDelete = async (appId: AppId, key: string) => {
  if (!key) {
    throw new Error('key is required');
  }

  await deleteEnv(appId, key);
  logger.info(`Environment variable connected to key: "${key}", was deleted`);
};

const handleEnvironmentListKeys = async (appId: AppId) => {
  const response = await listAppEnvKeys(appId);
  if (response?.length === 0) {
    logger.info('No environment variables found');
    return;
  }

  logger.info('App environment variable keys:');
  logger.table(response.map(key => ({ keys: key })));
};

const MAP_MODE_TO_HANDLER: Record<
  APP_ENV_MANAGEMENT_MODES,
  (appId: AppId, key: string, value: string) => Promise<void>
> = {
  [APP_ENV_MANAGEMENT_MODES.SET]: handleEnvironmentSet,
  [APP_ENV_MANAGEMENT_MODES.DELETE]: handleEnvironmentDelete,
  [APP_ENV_MANAGEMENT_MODES.LIST_KEYS]: handleEnvironmentListKeys,
};

export const handleEnvironmentRequest = async (
  appId: AppId,
  mode: APP_ENV_MANAGEMENT_MODES,
  key?: string,
  value?: string,
) => {
  if (!appId || !mode) {
    throw new Error('appId and mode are required');
  }

  const modeHandler = MAP_MODE_TO_HANDLER[mode];
  if (!modeHandler) {
    throw new Error('invalid mode');
  }

  await modeHandler(appId, key!, value!);
};
