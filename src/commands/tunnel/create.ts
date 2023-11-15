import { Flags } from '@oclif/core';
import { Listr } from 'listr2';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { connectTunnel, createTunnelConnection, generateTunnelingAuthToken } from 'services/tunnel-service';
import { TunnelCommandTasksContext } from 'types/commands/tunnel';
import { validateStringAsSafeInt } from 'types/utils/validation';
import logger from 'utils/logger';

export default class TunnelCreate extends AuthenticatedCommand {
  static description = 'Create a networking tunnel to publicly expose code running on the local machine.';

  static withPrintCommand = false;

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> -p PORT_FOR_TUNNEL',
    '<%= config.bin %> <%= command.id %> -a APP_ID_FOR_TUNNEL',
    '<%= config.bin %> <%= command.id %> -p PORT_FOR_TUNNEL -a APP_ID_FOR_TUNNEL',
  ];

  static flags = TunnelCreate.serializeFlags({
    port: Flags.integer({
      char: 'p',
      description: 'Port to forward tunnel traffic to.',
      default: 8080,
    }),
    appId: Flags.integer({
      char: 'a',
      description: 'Specify an app id to get a unique tunnel domain.',
      required: false,
    }),
  });

  DEBUG_TAG = 'tunnel_create';

  public async run(): Promise<void> {
    try {
      const { flags } = await this.parse(TunnelCreate);
      const { port, appId } = flags;

      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      logger.debug(`creating tunnel: port=${port}, appId=${appId}`, this.DEBUG_TAG);
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
          {
            title: 'Tunnel is open and functional',
            task: connectTunnel,
            enabled: ctx => Boolean(ctx.forwardingAddress) && Boolean(ctx.tunnel),
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
