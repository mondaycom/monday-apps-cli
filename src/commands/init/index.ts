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
  forcefullyExitAfterRun = false; // init exists in any case after it's run, so we don't need to forcefully exit
  static examples = ['<%= config.bin %> <%= command.id %> -t SECRET_TOKEN'];
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
  });

  static args = {};
  DEBUG_TAG = 'init';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Init);

    const args: InitCommandArguments = {
      [CONFIG_KEYS.ACCESS_TOKEN]: flags.token || (await accessTokenPrompt()),
    };

    try {
      if (flags.local) {
        this.config.configDir = getCurrentWorkingDirectory();
        createGitignoreAndAppendConfigFileIfNeeded(this.config.configDir);
      }

      ConfigService.init(args, this.config.configDir, { override: true, setInProcessEnv: true });
      logger.info(`'${CONFIG_NAME}' created inside '${this.config.configDir}'`);
    } catch (error) {
      logger.debug(error, this.DEBUG_TAG);
      logger.error(`'${CONFIG_NAME}' failed to initialize`);
    }
  }
}
