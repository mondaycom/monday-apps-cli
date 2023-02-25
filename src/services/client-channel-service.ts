import Logger from '../utils/logger.js';
import { ErrorMondayCode } from '../types/errors/index.js';
import { ClientChannel } from '../types/services/stats-service.js';
import Pusher from 'pusher-js';

export const streamMessages = (clientChannel: ClientChannel): Promise<void> => {
  return new Promise(resolve => {
    try {
      if (!clientChannel) {
        throw new Error('ClientChannel is missing.');
      }

      const writePusherLogs = (data: any): void => {
        console.log(data);
      };

      const disconnect = (channel: any): void => {
        if (channel) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
          channel.unsubscribe();
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
          channel.unbind_all();
        }

        resolve();
        console.log('Closed connection');
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore

      Pusher.logToConsole = true;
      Pusher.log = msg => {
        Logger.debug(msg);
      };

      const pusher = new Pusher(clientChannel.credentials!.key, {
        cluster: clientChannel.cluster,
      });

      const channel = pusher.subscribe(clientChannel.channelName);
      channel.bind('my-event', function (data: any) {
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
      console.log('Started to listen to logs');
      setTimeout(() => {
        // disconnect(channel);
      }, clientChannel.ttl * 1000);
    } catch (error: any | ErrorMondayCode) {
      Logger.debug(error);
      if (error instanceof ErrorMondayCode) {
        throw error;
      }

      throw new Error('Failed to messages stream channel.');
    }
  });
};
