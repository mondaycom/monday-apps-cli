import { appStorageConnectionStringUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { docsDbConnectionStringResponseSchema } from 'services/schemas/docs-db-service-schemas';
import { HttpError } from 'types/errors';
import { AppId } from 'types/general';
import { HttpMethodTypes } from 'types/services/api-service';
import { DocsDbConnectionStringResponseSchema } from 'types/services/docs-db-service';
import logger from 'utils/logger';
import { appsUrlBuilder } from 'utils/urls-builder';

export const getDocsDbConnectionString = async (appId: AppId): Promise<DocsDbConnectionStringResponseSchema> => {
  const DEBUG_TAG = 'get_docs_db_connection_string';
  try {
    const baseUrl = appStorageConnectionStringUrl(appId);
    const url = appsUrlBuilder(baseUrl);
    const response = await execute<DocsDbConnectionStringResponseSchema>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.GET,
      },
      docsDbConnectionStringResponseSchema,
    );
    return response;
  } catch (error: any | HttpError) {
    logger.debug(error, DEBUG_TAG);
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('Failed to fetch docs-db connection string.');
  }
};
