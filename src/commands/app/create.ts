import { Flags } from '@oclif/core';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { createApp } from 'services/apps-service';
import logger from 'utils/logger';

export default class AppCreate extends AuthenticatedCommand {
  static description = 'Create an app.';

  static withPrintCommand = false;

  static examples = ['<%= config.bin %> <%= command.id %>', '<%= config.bin %> <%= command.id %> -n NEW_APP_NAME'];

  static flags = AppCreate.serializeFlags({
    name: Flags.string({
      char: 'n',
      description: 'Name your new app.',
      required: false,
    }),
  });

  DEBUG_TAG = 'app_create';

  public async run(): Promise<void> {
    try {
      const { flags } = await this.parse(AppCreate);
      const { name } = flags;

      logger.debug(`invoking create app: name=${name}`, this.DEBUG_TAG);
      const app = await createApp();
      logger.success(`App created successfully: ${app.name} (id: ${app.id})`);
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);

      // need to signal to the parent process that the command failed
      process.exit(1);
    }
  }
}
