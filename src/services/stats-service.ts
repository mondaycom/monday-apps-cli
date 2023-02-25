import { logsStreamForAppFeatureIdUrl } from '../consts/urls.js';
import urlBuilder from '../utils/urls-builder.js';
import { execute } from './monday-code-service.js';
import { HttpMethodTypes } from '../types/services/monday-code-service.js';
import logger from '../utils/logger.js';
import { ErrorMondayCode } from '../types/errors/index.js';
import { clientChannelSchema } from './schemas/stats-schema.js';
import { ClientChannel } from '../types/services/stats-service.js';

export const logsStream = async (appFeatureId: number, logsType: string): Promise<ClientChannel> => {
  try {
    const baseSignUrl = logsStreamForAppFeatureIdUrl(appFeatureId);
    const url = urlBuilder(baseSignUrl);
    const response = await execute<ClientChannel>(
      {
        url,
        body: {
          logsType,
        },
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.POST,
      },
      clientChannelSchema,
    );
    return response;
  } catch (error: any | ErrorMondayCode) {
    logger.debug(error);
    if (error instanceof ErrorMondayCode) {
      throw error;
    }

    throw new Error('Failed to open logs channel.');
  }
};
