import { Flags } from '@oclif/core';
import { Listr } from 'listr2';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_ID_TO_ENTER, PORT_TO_ENTER } from 'consts/messages';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { createTunnelConnection, generateTunnelingAuthToken } from 'services/tunnel-service';
import { TunnelCommandTasksContext } from 'types/commands/tunnel';
import { validateStringAsSafeInt } from 'types/utils/validation';
import logger from 'utils/logger';

export default class AppTunnel extends AuthenticatedCommand {
  static description = 'Create an app tunnel to expose code running on the local machine.';

  static withPrintCommand = false;

  static examples = ['<%= config.bin %> <%= command.id %>', '<%= config.bin %> <%= command.id %> -a APP_ID_FOR_TUNNEL'];

  static flags = AppTunnel.serializeFlags({
    port: Flags.integer({
      char: 'i',
      aliases: ['p'],
      description: PORT_TO_ENTER,
      required: true, // TODO: Maor: consider to make not required, but prompt for user keyboard input?
    }),
    appId: Flags.integer({
      char: 'i',
      aliases: ['a'],
      description: APP_ID_TO_ENTER,
      required: false,
    }),
  });

  DEBUG_TAG = 'app_tunnel';

  public async run(): Promise<void> {
    try {
      const { flags } = await this.parse(AppTunnel);
      const port = flags.port;
      let appId = flags.appId;

      if (!appId) {
        appId = await DynamicChoicesService.chooseApp(true);
      }

      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      logger.debug(`generating tunnel for appId: ${appId}`, this.DEBUG_TAG);
      const tasks = new Listr<TunnelCommandTasksContext>(
        [
          {
            title: 'Fetching tunnel connection auth token',
            task: generateTunnelingAuthToken,
            enabled: () => validateStringAsSafeInt(String(port)),
          },
          {
            title: 'Creating tunnel connection',
            task: createTunnelConnection,
            enabled: ctx => Boolean(ctx.authToken) && Boolean(ctx.tunnelDomain),
          },
        ],
        { ctx: { appId, tunnelPort: port } },
      );

      await tasks.run();
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);

      // need to signal to the parent process that the command failed
      process.exit(1);
    }
  }
}
