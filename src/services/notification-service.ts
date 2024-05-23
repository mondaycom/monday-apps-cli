import { StatusCodes } from 'http-status-codes';

import { getLogsStreamForAppVersionIdUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { clientChannelSchema } from 'services/schemas/notification-schema';
import { LogType, LogsFilterCriteriaArguments } from 'types/commands/logs';
import { HttpError } from 'types/errors';
import { Region } from 'types/general/region';
import { HttpMethodTypes } from 'types/services/api-service';
import { ClientChannel } from 'types/services/notification-service';
import logger from 'utils/logger';
import { addRegionToQuery } from 'utils/region';
import { appsUrlBuilder } from 'utils/urls-builder';

export const logsStream = async (
  appVersionId: number,
  logsType: LogType,
  logsFilterCriteria?: LogsFilterCriteriaArguments | null,
  region?: Region,
): Promise<ClientChannel> => {
  try {
    const logsStreamForUrl = getLogsStreamForAppVersionIdUrl(appVersionId, logsType, logsFilterCriteria);
    const url = appsUrlBuilder(logsStreamForUrl);
    logger.debug(`fetching logs url: ${url}`);
    const query = addRegionToQuery({}, region);
    const response = await execute<ClientChannel>(
      {
        query,
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.GET,
      },
      clientChannelSchema,
    );
    return response;
  } catch (error: any) {
    if (error instanceof HttpError) {
      const finalHttpError =
        error.code === StatusCodes.NOT_FOUND
          ? new Error('monday-code deployment not found for the requested app-version')
          : error;
      throw finalHttpError;
    }

    throw new Error('Failed to open logs channel.');
  }
};
