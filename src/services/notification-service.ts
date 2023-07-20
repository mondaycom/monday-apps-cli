import { getLogsStreamForAppVersionIdUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { clientChannelSchema } from 'services/schemas/notification-schema';
import { LogType, LogsFilterCriteriaArguments } from 'types/commands/logs';
import { HttpError } from 'types/errors';
import { HttpMethodTypes } from 'types/services/api-service';
import { ClientChannel } from 'types/services/notification-service';
import logger from 'utils/logger';
import { appsUrlBuilder } from 'utils/urls-builder';

export const logsStream = async (
  appVersionId: number,
  logsType: LogType,
  logsFilterCriteria?: LogsFilterCriteriaArguments | null,
): Promise<ClientChannel> => {
  const DEBUG_TAG = 'logs_stream';
  try {
    const logsStreamForUrl = getLogsStreamForAppVersionIdUrl(appVersionId, logsType);
    const url = appsUrlBuilder(logsStreamForUrl);
    logger.debug(`fetching logs url: ${url}`);
    const response = await execute<ClientChannel>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.GET,
      },
      clientChannelSchema,
    );
    return response;
  } catch (error: any) {
    logger.debug(error, DEBUG_TAG);
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('Failed to open logs channel.');
  }
};
