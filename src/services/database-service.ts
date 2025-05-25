import { appStorageConnectionStringUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { databaseConnectionStringResponseSchema } from 'services/schemas/database-service-schemas';
import { HttpError } from 'types/errors';
import { AppId } from 'types/general';
import { HttpMethodTypes } from 'types/services/api-service';
import { DatabaseConnectionStringResponseSchema } from 'types/services/database-service';
import logger from 'utils/logger';
import { appsUrlBuilder } from 'utils/urls-builder';

export const getDatabaseConnectionString = async (appId: AppId): Promise<DatabaseConnectionStringResponseSchema> => {
  const DEBUG_TAG = 'get_database_connection_string';
  try {
    const baseUrl = appStorageConnectionStringUrl(appId);
    const url = appsUrlBuilder(baseUrl);
    const response = await execute<DatabaseConnectionStringResponseSchema>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.GET,
      },
      databaseConnectionStringResponseSchema,
    );
    return response;
  } catch (error: any | HttpError) {
    logger.debug(error, DEBUG_TAG);
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('Failed to fetch database connection string.');
  }
};
