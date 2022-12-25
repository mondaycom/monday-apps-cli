import { Command, Flags } from '@oclif/core';
import { ConfigService } from '../../services/config-service.js';
import Logger from '../../utils/logger.js';
import { PromptService } from '../../services/prompt-service.js';
import { PushCommandArguments } from '../../types/commands/push.js';
import { getSignedStorageUrl, uploadFileToStorage } from '../../services/push-service.js';
import { createSpinner } from 'nanospinner';
import {accessTokenNotFound} from '../../consts/access-token-messages.js';
import {
  errorOnUploadingZipFile,
  successfullyUploadingZipFile,
  zipFileLocation,
} from '../../consts/zip-file-messages.js';
import {appVersionIdToEnter} from '../../consts/app-version-id-messages.js';
import {pushCommandDescription} from '../../consts/push-command-messages.js';
import {getFileExtension, readFileData} from '../../services/files-service.js';

const fileExtensions = ['zip']
const filePathPrompt = async () => PromptService.promptFile(zipFileLocation, fileExtensions);

const versionPrompt = async () => PromptService.promptInputNumber(appVersionIdToEnter, true);

const MESSAGES = {
  file: zipFileLocation,
  appVersionId: appVersionIdToEnter,
};

export default class Push extends Command {
  static description = pushCommandDescription;

  static examples = ['<%= config.bin %> <%= command.id %> -f ZIP FILE PATH -v VERSION TO PUSH '];

  static flags = {
    filePath: Flags.string({
      char: 'f',
      description: MESSAGES.file,
    }),
    appVersionId: Flags.integer({
      char: 'v',
      description: MESSAGES.appVersionId,
    }),
  };

  static args = [];

  public async run(): Promise<void> {
    const accessToken = ConfigService.getConfigDataByKey('accessToken');
    if (!accessToken) {
      Logger.error(accessTokenNotFound);
      return;
    }

    const { flags } = await this.parse(Push);

    const args: PushCommandArguments = {
      filePath: flags.filePath || (await filePathPrompt()),
      appVersionId: flags.appVersionId || Number(await versionPrompt()),
    };
    const pushSpinner = createSpinner().start();
    try {
      if (fileExtensions &&
          fileExtensions.length > 0 && !fileExtensions.includes(getFileExtension(args.filePath).toLowerCase())) {
        throw new Error(`The process supports those file extensions: ${fileExtensions.join(',')}`);
      }

      const signedCloudStorageUrl = await getSignedStorageUrl(accessToken, args.appVersionId);
      const zipFileContent = readFileData(args.filePath);
      await uploadFileToStorage(signedCloudStorageUrl, zipFileContent, 'application/zip');
      pushSpinner.success({ text: successfullyUploadingZipFile });
    } catch (error) {
      Logger.debug((error as Error).message);
      pushSpinner.error({ text: errorOnUploadingZipFile });
    } finally {
      pushSpinner.clear();
    }
  }
}
