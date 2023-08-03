import Pusher from 'pusher-js';
import Channel from 'pusher-js/types/src/core/channels/channel';

import { LogItem, LogItemSeverity } from 'types/communication/log-item-types';
import { StreamLogType, StreamMessage } from 'types/services/client-channel-service';
import { ClientChannel } from 'types/services/notification-service';
import { isDefined } from 'utils/guards';
import logger from 'utils/logger.js';

const mapSeverityToLogFunction: {
  [LogItemSeverity.ERROR]: (...args: unknown[]) => void;
  [LogItemSeverity.INFO]: (...args: unknown[]) => void;
  [LogItemSeverity.DEBUG]: (...args: unknown[]) => void;
  [LogItemSeverity.WARNING]: (...args: unknown[]) => void;
} = {
  [LogItemSeverity.DEBUG]: (...args: unknown[]) => logger.debug(args),
  [LogItemSeverity.INFO]: logger.info,
  [LogItemSeverity.WARNING]: logger.warn,
  [LogItemSeverity.ERROR]: logger.error,
};

const SUPPORTED_LOG_SEVERITIES = Object.keys(mapSeverityToLogFunction) as Array<keyof typeof mapSeverityToLogFunction>;

export const streamMessages = (clientChannel: ClientChannel): Promise<void> => {
  const DEBUG_TAG = 'streamMessages';
  return new Promise(resolve => {
    try {
      if (!clientChannel) {
        throw new Error('ClientChannel is missing.');
      }

      if (!clientChannel.credentials) {
        throw new Error('ClientChannel credentials are missing.');
      }

      const writePusherLogs = (data: LogItem[]): void => {
        data.map(logItem => {
          const object = { request: logItem.request, response: logItem.response };
          let logMethod = logger.log;
          const severity = logItem.severity as keyof typeof mapSeverityToLogFunction;
          const isSeverityValid = SUPPORTED_LOG_SEVERITIES.includes(severity);
          if (isSeverityValid && isDefined(severity)) {
            logMethod = mapSeverityToLogFunction[severity];
          }

          return logItem.message
            ? logMethod(`[${logItem.type}]${logItem.message}`)
            : logMethod(object, `[${logItem.type}]`);
        });
      };

      const disconnect = (channel: Channel): void => {
        if (channel) {
          channel.unsubscribe();

          channel.unbind_all();
        }

        logger.log(`------------------
                     Closed connection.`);
        resolve();
      };

      Pusher.logToConsole = true;
      Pusher.log = msg => {
        logger.debug(msg, DEBUG_TAG);
      };

      const pusher = new Pusher(clientChannel.credentials.key, {
        cluster: clientChannel.cluster,
      });

      const channel = pusher.subscribe(clientChannel.channelName);
      channel.bind(clientChannel.channelEvents[0], function (data: StreamMessage) {
        switch (data?.type) {
          case StreamLogType.HTTP:
          case StreamLogType.CONSOLE: {
            writePusherLogs(data.data as LogItem[]);
            break;
          }

          case StreamLogType.DISCONNECT: {
            disconnect(channel);
            break;
          }
        }
      });
      logger.debug(`Trying to listen to channel: ${clientChannel.channelName}`, DEBUG_TAG);
      pusher.connection.bind('connected', () => {
        logger.log(`Fetching logs:
                     ------------------`);
        setTimeout(() => {
          disconnect(channel);
        }, clientChannel.ttl * 1000);
      });
    } catch (error: any) {
      logger.debug(error, DEBUG_TAG);
      throw new Error(`Failed to stream messages to channel "${clientChannel.channelName}"`);
    }
  });
};
