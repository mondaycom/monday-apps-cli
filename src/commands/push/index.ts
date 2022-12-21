import { Command, Flags } from '@oclif/core';
import { ConfigService } from '../../services/config-service.js';
import Logger from '../../utils/logger.js';
import { PromptService } from '../../services/prompt-service.js';
import { PushCommandArguments } from '../../types/commands/push';
import { getFileData, getSignedCloudStorageUrl, uploadFileToCloudStorage } from '../../services/push-service.js';

const filePathPrompt = async () => PromptService.promptFile('Please the zip file path on your local machine', ['zip']);

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
    const accessToken = ConfigService.getConfigDataByKey('accessToken');
    if (!accessToken) {
      console.log('Access token is missing, please run: "mcode init"');
      return;
    }

    const { flags } = await this.parse(Push);

    const args: PushCommandArguments = {
      file: flags.file || (await filePathPrompt()),
      version: flags.version || (await versionPrompt()),
      accessToken,
    };
    Logger.info(`'${JSON.stringify(args)}' args`);
    try {
      const signedCloudStorageUrl = await getSignedCloudStorageUrl(args);
      const zipFileContent = await getFileData(args);
      const data = await uploadFileToCloudStorage(signedCloudStorageUrl, zipFileContent, 'application/zip');
      Logger.info(`'${JSON.stringify(data)}' urlToUploadZipFile`);
    } catch (error) {
      Logger.error((error as Error).message);
    }
  }
}
