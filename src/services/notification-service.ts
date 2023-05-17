import { logsStreamForAppVersionIdUrl } from '../consts/urls.js';
import { appsUrlBuilder } from '../utils/urls-builder.js';
import { execute } from './monday-code-service.js';
import { HttpMethodTypes } from '../types/services/monday-code-service.js';
import logger from '../utils/logger.js';
import { ErrorMondayCode } from '../types/errors/index.js';
import { clientChannelSchema } from './schemas/notification-schema.js';
import { ClientChannel } from '../types/services/notification-service.js';
import { LogType } from '../types/commands/logs.js';

export const logsStream = async (appVersionId: number, logsType: LogType): Promise<ClientChannel> => {
  try {
    const logsStreamForUrl = logsStreamForAppVersionIdUrl(appVersionId, logsType);
    const url = appsUrlBuilder(logsStreamForUrl);
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
    logger.debug(error);
    if (error instanceof ErrorMondayCode) {
      throw error;
    }

    throw new Error('Failed to open logs channel.');
  }
};
