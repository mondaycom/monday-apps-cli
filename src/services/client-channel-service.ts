import logger from '../utils/logger.js';
import { ClientChannel } from '../types/services/notification-service.js';
import Pusher from 'pusher-js';
import Channel from 'pusher-js/types/src/core/channels/channel';

export const streamMessages = (clientChannel: ClientChannel): Promise<void> => {
  return new Promise(resolve => {
    try {
      if (!clientChannel) {
        throw new Error('ClientChannel is missing.');
      }

      if (!clientChannel.credentials) {
        throw new Error('ClientChannel credentials are missing.');
      }

      const writePusherLogs = (data: any): void => {
        logger.log(data);
      };

      const disconnect = (channel: Channel): void => {
        if (channel) {
          channel.unsubscribe();

          channel.unbind_all();
        }

        resolve();
        logger.log('Closed connection');
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore

      Pusher.logToConsole = true;
      Pusher.log = msg => {
        logger.debug(msg);
      };

      const pusher = new Pusher(clientChannel.credentials.key, {
        cluster: clientChannel.cluster,
      });

      const channel = pusher.subscribe(clientChannel.channelName);
      channel.bind(clientChannel.channelEvents[0], function (data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        switch (data?.type) {
          case 'log': {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            writePusherLogs(data.data);
            break;
          }

          case 'disconnect': {
            disconnect(channel);
            break;
          }
        }
      });
      logger.log('Started to listen to logs');
      setTimeout(() => {
        disconnect(channel);
      }, clientChannel.ttl * 1000);
    } catch (error: any) {
      logger.debug(error);

      throw new Error(`Failed to stream messages to channel "${clientChannel.channelName}"`);
    }
  });
};
