import { Flags } from '@oclif/core';
import Logger from '../../utils/logger.js';
import { PromptService } from '../../services/prompt-service.js';
import { ConfigService, CONFIG_NAME } from '../../services/config-service.js';
import { InitCommandArguments } from '../../types/commands/init.js';
import { BaseCommand } from '../base-command.js';
import {
  ACCESS_TOKEN_PROMPT_MESSAGE,
  ACCESS_TOKEN_PROMPT_VALIDATION_MESSAGE,
  INIT_COMMAND_DESCRIPTION,
  INIT_DESCRIPTION,
} from '../../consts/messages.js';

const accessTokenPrompt = async () =>
  PromptService.promptForHiddenInput('token', ACCESS_TOKEN_PROMPT_MESSAGE, ACCESS_TOKEN_PROMPT_VALIDATION_MESSAGE);

export default class Init extends BaseCommand {
  static description = `${INIT_COMMAND_DESCRIPTION}'${CONFIG_NAME}'`;

  static examples = ['<%= config.bin %> <%= command.id %> -t SECRET_TOKEN'];

  static flags = {
    ...BaseCommand.globalFlags,
    token: Flags.string({
      char: 't',
      description: INIT_DESCRIPTION,
    }),
  };

  static args = [];

  public async run(): Promise<void> {
    const { flags } = await this.parse(Init);

    const args: InitCommandArguments = {
      accessToken: flags.token || (await accessTokenPrompt()),
    };

    try {
      ConfigService.init(args, this.config.configDir, { override: true, setInProcessEnv: true });
      Logger.info(`'${CONFIG_NAME}' created`);
    } catch (error) {
      Logger.debug((error as Error).message);
      Logger.error(`'${CONFIG_NAME}' failed to initialize`);
    }
  }
}
