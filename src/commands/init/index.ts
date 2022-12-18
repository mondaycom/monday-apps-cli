import { Command, Flags } from '@oclif/core';
import { PromptService } from '../../services/prompt-service.js';
import { ConfigService, CONFIG_NAME } from '../../services/config-service.js';
import { InitCommandArguments } from '../../types/commands/init.js';

export default class Init extends Command {
  static description = `Initialize monday-code config file - '${CONFIG_NAME}'`;

  static examples = ['<%= config.bin %> <%= command.id %> -t SECRET_TOKEN'];

  static flags = {
    token: Flags.string({
      char: 't',
      description: 'monday.com api access token (https://developer.monday.com/api-reference/docs/authentication)',
    }),
  };

  static args = [];

  public async run(): Promise<void> {
    const { flags } = await this.parse(Init);

    const args: InitCommandArguments = {
      accessToken:
        flags.token ||
        (await PromptService.promptForHiddenInput(
          'token',
          'Please enter your monday.com api access token',
          'You must provide an access token',
        )),
    };

    try {
      ConfigService.init(args, this.config.configDir, { override: true, setInProcessEnv: true });
      console.info(`'${CONFIG_NAME}' created`);
    } catch (error) {
      console.debug((error as Error).message);
      console.error(`'${CONFIG_NAME}' failed to initialize`);
    }
  }
}
