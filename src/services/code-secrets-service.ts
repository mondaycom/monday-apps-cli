import { appSecretKeysUrl, appSecretsUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { listAppSecretsResponseSchema } from 'services/schemas/code-secrets-service-schemas';
import { HttpError } from 'types/errors';
import { AppId } from 'types/general';
import { HttpMethodTypes } from 'types/services/api-service';
import { ListAppSecretsResponse } from 'types/services/code-secrets-service';
import logger from 'utils/logger';
import { appsUrlBuilder } from 'utils/urls-builder';

export const listAppSecretKeys = async (appId: AppId): Promise<Array<string>> => {
  const DEBUG_TAG = 'list_app_secret_keys';
  try {
    const path = appSecretKeysUrl(appId);
    const url = appsUrlBuilder(path);
    const response = await execute<ListAppSecretsResponse>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.GET,
      },
      listAppSecretsResponseSchema,
    );

    return response.keys;
  } catch (error: any) {
    logger.debug(error, DEBUG_TAG);
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('failed to list app secret keys');
  }
};

export const setSecret = async (appId: AppId, key: string, secret: string) => {
  const DEBUG_TAG = 'set_secret';
  try {
    const path = appSecretsUrl(appId, key);
    const url = appsUrlBuilder(path);
    await execute({
      url,
      headers: { Accept: 'application/json' },
      method: HttpMethodTypes.PUT,
      body: { secret },
    });
  } catch (error: any) {
    logger.debug(error, DEBUG_TAG);
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('failed to add secret');
  }
};

export const deleteSecret = async (appId: AppId, key: string) => {
  const DEBUG_TAG = 'delete_secret';
  try {
    const path = appSecretsUrl(appId, key);
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

    throw new Error('failed to delete secret');
  }
};
