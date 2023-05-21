import Pusher from 'pusher-js';
import Channel from 'pusher-js/types/src/core/channels/channel';

import { LogItem } from 'types/communication/log-item-types';
import { StreamLogType, StreamMessage } from 'types/services/client-channel-service';
import { ClientChannel } from 'types/services/notification-service';
import logger from 'utils/logger.js';

export const streamMessages = (clientChannel: ClientChannel): Promise<void> => {
  return new Promise(resolve => {
    try {
      if (!clientChannel) {
        throw new Error('ClientChannel is missing.');
      }

      if (!clientChannel.credentials) {
        throw new Error('ClientChannel credentials are missing.');
      }

      const writePusherLogs = (data: LogItem[]): void => {
        data?.map(logItem => {
          return logger.log(`[${logItem.type}]${JSON.stringify(logItem)}`);
        });
      };

      const disconnect = (channel: Channel): void => {
        if (channel) {
          channel.unsubscribe();

          channel.unbind_all();
        }

        resolve();
        logger.log('Closed connection');
      };

      Pusher.logToConsole = true;
      Pusher.log = msg => {
        logger.debug(msg);
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
      logger.log('Opening communication channel...');
      logger.debug(`Trying to listen to channel: ${clientChannel.channelName}`);
      pusher.connection.bind('connected', () => {
        logger.log('Started logs listening...');
        setTimeout(() => {
          disconnect(channel);
        }, clientChannel.ttl * 1000);
      });
    } catch (error: any) {
      logger.debug(error);

      throw new Error(`Failed to stream messages to channel "${clientChannel.channelName}"`);
    }
  });
};
