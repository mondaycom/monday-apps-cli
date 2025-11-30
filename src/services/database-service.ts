import chalk from 'chalk';

import { appStorageConnectionStringUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { databaseConnectionStringResponseSchema } from 'services/schemas/database-service-schemas';
import { HttpError } from 'types/errors';
import { AppId } from 'types/general';
import { HttpMethodTypes } from 'types/services/api-service';
import { DatabaseConnectionStringResponseSchema } from 'types/services/database-service';
import logger from 'utils/logger';
import { appsUrlBuilder } from 'utils/urls-builder';

const getPublicIp = async (): Promise<string> => {
  const response = await fetch('https://checkip.amazonaws.com/');
  if (!response.ok) {
    throw new Error('Could not fetch public IP address.');
  }

  const ip = await response.text();
  return ip.trim();
};

export const getDatabaseConnectionString = async (appId: AppId): Promise<DatabaseConnectionStringResponseSchema> => {
  const DEBUG_TAG = 'get_database_connection_string';
  try {
    const baseUrl = appStorageConnectionStringUrl(appId);
    const url = appsUrlBuilder(baseUrl);
    const publicIp = await getPublicIp();

    logger.log(chalk.dim(`Retrieving database connection string... client IP: ${publicIp}`));
    const response = await execute<DatabaseConnectionStringResponseSchema>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.GET,
        query: { clientIp: publicIp },
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
