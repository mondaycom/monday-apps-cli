import { Command, Flags } from '@oclif/core';
import { ConfigService } from '../../services/config-service.js';
import Logger from '../../utils/logger.js';
import { PromptService } from '../../services/prompt-service.js';
import { PushCommandArguments } from '../../types/commands/push';
import { pushZipToCloud } from '../../services/push-service.js';

const filePathPrompt = async () => PromptService.promptInput('Please the zip file path on your local machine', true);

const versionPrompt = async () => PromptService.promptInput('Please enter the version number', true);

const MESSAGES = {
  file: 'Zipped file path/location',
  version: 'The version that you want to push',
};

export default class Push extends Command {
  static description = 'Push a zip file with code to Monday-Code';

  static examples = ['<%= config.bin %> <%= command.id %> -f ZIP FILE PATH -v VERSION TO PUSH '];

  static flags = {
    file: Flags.string({
      char: 'f',
      description: MESSAGES.file,
    }),
    version: Flags.string({
      char: 'v',
      description: MESSAGES.version,
    }),
  };

  static args = [];

  public async run(): Promise<void> {
    ConfigService.loadConfigToProcessEnv(this.config.configDir);
    const { flags } = await this.parse(Push);

    const args: PushCommandArguments = {
      file: flags.file || (await filePathPrompt()),
      version: flags.version || (await versionPrompt()),
    };
    Logger.info(`'${JSON.stringify(args)}' args`);
    try {
      const accessToken = ConfigService.getConfigDataByKey('accessToken');
      pushZipToCloud();
      console.info(`'${accessToken}' output`);
    } catch (error) {
      console.error((error as Error).message);
    }
  }
}
