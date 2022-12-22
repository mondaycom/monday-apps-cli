import { Command, Flags } from '@oclif/core';
import { ConfigService } from '../../services/config-service.js';
import Logger from '../../utils/logger.js';
import { PromptService } from '../../services/prompt-service.js';
import { PushCommandArguments } from '../../types/commands/push.js';
import { getFileData, getSignedCloudStorageUrl, uploadFileToCloudStorage } from '../../services/push-service.js';
import { createSpinner } from 'nanospinner';

const filePathPrompt = async () => PromptService.promptFile('Please add the zip file path on your machine', ['zip']);

const versionPrompt = async () => PromptService.promptInput('Please enter the app version id', true);

const MESSAGES = {
  file: 'Zipped file path/location',
  appVersionId: 'The id of the app version you want to push to',
};

export default class Push extends Command {
  static description = 'Push your code to get hosted on monday-code';

  static examples = ['<%= config.bin %> <%= command.id %> -f ZIP FILE PATH -v VERSION TO PUSH '];

  static flags = {
    file: Flags.string({
      char: 'f',
      description: MESSAGES.file,
    }),
    version: Flags.string({
      char: 'v',
      description: MESSAGES.appVersionId,
    }),
  };

  static args = [];

  public async run(): Promise<void> {
    const accessToken = ConfigService.getConfigDataByKey('accessToken');
    if (!accessToken) {
      console.error('Access token is missing, please run: "mcode init"');
      return;
    }

    const { flags } = await this.parse(Push);

    const args: PushCommandArguments = {
      file: flags.file || (await filePathPrompt()),
      version: flags.version || (await versionPrompt()),
    };
    const pushSpinner = createSpinner().start();
    try {
      const signedCloudStorageUrl = await getSignedCloudStorageUrl(accessToken, args);
      const zipFileContent = getFileData(args);
      const data: any = await uploadFileToCloudStorage(signedCloudStorageUrl, zipFileContent, 'application/zip');
      pushSpinner.success({ text: 'Zip file uploaded' });
      Logger.info(`'${JSON.stringify(data)}' urlToUploadZipFile`);
    } catch (error) {
      Logger.error((error as Error).message);
    } finally {
      pushSpinner.stop();
    }
  }
}
