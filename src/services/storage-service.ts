import { getStorageItemsExportUrl, getStorageItemsSearchUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import {
  appStorageApiRecordsSearchResponseExportSchema,
  appStorageApiRecordsSearchResponseSearchSchema,
} from 'services/schemas/storage-service-schemas';
import { HttpError } from 'types/errors';
import { HttpMethodTypes } from 'types/services/api-service';
import {
  AppStorageApiRecordsSearchResponseExportSchema,
  AppStorageApiRecordsSearchResponseSearchSchema,
} from 'types/services/storage-service';
import logger from 'utils/logger';
import { appsUrlBuilder } from 'utils/urls-builder';

export const getStorageItemsSearch = async (
  appId: number,
  clientAccountId: number,
  term: string,
): Promise<AppStorageApiRecordsSearchResponseSearchSchema> => {
  const DEBUG_TAG = 'get_storage_items_search_url';
  try {
    const baseSignUrl = getStorageItemsSearchUrl(appId, clientAccountId, term);
    const url = appsUrlBuilder(baseSignUrl);
    const response = await execute<AppStorageApiRecordsSearchResponseSearchSchema>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.GET,
      },
      appStorageApiRecordsSearchResponseSearchSchema,
    );
    return response;
  } catch (error: any | HttpError) {
    logger.debug(error, DEBUG_TAG);
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('Failed to fetch storage items.');
  }
};

export const getStorageItemsExport = async (
  appId: number,
  clientAccountId: number,
): Promise<AppStorageApiRecordsSearchResponseExportSchema> => {
  const DEBUG_TAG = 'get_storage_items_export_url';
  try {
    const baseSignUrl = getStorageItemsExportUrl(appId, clientAccountId);
    const url = appsUrlBuilder(baseSignUrl);
    const response = await execute<AppStorageApiRecordsSearchResponseExportSchema>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.GET,
      },
      appStorageApiRecordsSearchResponseExportSchema,
    );
    return response;
  } catch (error: any | HttpError) {
    logger.debug(error, DEBUG_TAG);
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('Failed to fetch storage items.');
  }
};
