import { logsStreamForAppFeatureIdUrl } from '../consts/urls.js';
import urlBuilder from '../utils/urls-builder.js';
import { execute } from './monday-code-service.js';
import { HttpMethodTypes } from '../types/services/monday-code-service.js';
import logger from '../utils/logger.js';
import { ErrorMondayCode } from '../types/errors/index.js';
import { clientChannelSchema } from './schemas/notification-schema.js';
import { ClientChannel } from '../types/services/notification-service.js';
import { LogType } from '../types/commands/logs.js';

export const logsStream = async (appFeatureId: number, logsType: LogType): Promise<ClientChannel> => {
  try {
    const logsStreamForUrl = logsStreamForAppFeatureIdUrl(appFeatureId, logsType);
    const url = urlBuilder(logsStreamForUrl);
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
