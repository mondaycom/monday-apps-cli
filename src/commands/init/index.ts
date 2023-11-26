import { Flags } from '@oclif/core';

import { BaseCommand } from 'commands-base/base-command';
import { CONFIG_KEYS } from 'consts/config';
import { CONFIG_NAME, ConfigService } from 'services/config-service';
import { getCurrentWorkingDirectory } from 'services/env-service';
import { createGitignoreAndAppendConfigFileIfNeeded } from 'services/files-service';
import { PromptService } from 'services/prompt-service';
import { InitCommandArguments } from 'types/commands/init';
import logger from 'utils/logger';

const accessTokenPrompt = async () =>
  PromptService.promptForHiddenInput(
    'token',
    'Please enter your monday.com api access token',
    'You must provide an access token',
  );

export default class Init extends BaseCommand {
  static description = `Initialize mapps config file - "${CONFIG_NAME}".`;
  static withPrintCommand = false;
  static examples = [
    '<%= config.bin %> <%= command.id %> -t SECRET_TOKEN',
    '<%= config.bin %> <%= command.id %> -t SECRET_TOKEN -l -s ./ -c ./build',
  ];

  static flags = Init.serializeFlags({
    token: Flags.string({
      char: 't',
      description: 'monday.com api access token (https://developer.monday.com/api-reference/docs/authentication)',
    }),
    local: Flags.boolean({
      char: 'l',
      description: 'create the configuration file locally, in the current project working directory',
      default: false,
      required: false,
    }),
    serverSidePath: Flags.string({
      char: 's',
      description: 'set a default path for your server side project (recommended in FullStack project)',
    }),
    clientSidePath: Flags.string({
      char: 'c',
      description: 'set a default path for your client side project (recommended in FullStack project)',
    }),
  });

  static args = {};
  DEBUG_TAG = 'init';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Init);

    const args: InitCommandArguments = {
      ...(flags.token ? { [CONFIG_KEYS.ACCESS_TOKEN]: flags.token } : {}),
      ...(flags.serverSidePath ? { [CONFIG_KEYS.SERVER_SIDE_PATH]: flags.serverSidePath } : {}),
      ...(flags.clientSidePath ? { [CONFIG_KEYS.CLIENT_SIDE_PATH]: flags.clientSidePath } : {}),
    };

    if (Object.keys(args).length === 0) {
      args[CONFIG_KEYS.ACCESS_TOKEN] = await accessTokenPrompt();
    }

    try {
      if (flags.local) {
        this.config.configDir = getCurrentWorkingDirectory();
        createGitignoreAndAppendConfigFileIfNeeded(this.config.configDir);
      }

      ConfigService.init(args, this.config.configDir, { override: true, setInProcessEnv: true });
      logger.info(`'${CONFIG_NAME}' created`);
    } catch (error) {
      logger.debug(error, this.DEBUG_TAG);
      logger.error(`'${CONFIG_NAME}' failed to initialize`);
    }
  }
}
