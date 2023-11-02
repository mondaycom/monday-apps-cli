import { getStorageItemsSearchUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { appStorageApiRecordsSearchResponseSchema } from 'services/schemas/storage-service-schemas';
import { HttpError } from 'types/errors';
import { HttpMethodTypes } from 'types/services/api-service';
import { AppStorageApiRecordsSearchResponseSchema } from 'types/services/storage-service';
import logger from 'utils/logger';
import { appsUrlBuilder } from 'utils/urls-builder';

export const getStorageItemsSearch = async (
  appId: number,
  clientAccountId: number,
  term: string,
): Promise<AppStorageApiRecordsSearchResponseSchema> => {
  const DEBUG_TAG = 'get_storage_items_search_url';
  try {
    const baseSignUrl = getStorageItemsSearchUrl(appId, clientAccountId, term);
    const url = appsUrlBuilder(baseSignUrl);
    const response = await execute<AppStorageApiRecordsSearchResponseSchema>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.GET,
      },
      appStorageApiRecordsSearchResponseSchema,
    );
    return response;
  } catch (error: any | HttpError) {
    logger.debug(error, DEBUG_TAG);
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('Failed to build remote location for upload.');
  }
};
