import { Flags } from '@oclif/core';
import { ConfigService } from '../../services/config-service.js';
import Logger from '../../utils/logger.js';
import { PromptService } from '../../services/prompt-service.js';
import { PushCommandArguments } from '../../types/commands/push.js';
import { getSignedStorageUrl, uploadFileToStorage } from '../../services/push-service.js';
import { createSpinner } from 'nanospinner';
import {
  ACCESS_TOKEN_NOT_FOUND,
  APP_VERSION_ID_TO_ENTER,
  PUSH_COMMAND_DESCRIPTION,
  ERROR_ON_UPLOADING_ZIP_FILE,
  SUCCESSFULLY_UPLOADING_ZIP_FILE,
  ZIP_FILE_LOCATION,
  PUSH_FILE_TO_UPLOAD_EXTENSIONS_ERROR,
} from '../../consts/messages.js';
import { getFileExtension, readFileData } from '../../services/files-service.js';
import logger from '../../utils/logger.js';
import { BaseCommand } from '../base-command.js';

const fileExtensions = ['zip'];
const filePathPrompt = async () => PromptService.promptFile(ZIP_FILE_LOCATION, fileExtensions);

const versionPrompt = async () => PromptService.promptInputNumber(APP_VERSION_ID_TO_ENTER, true);

const MESSAGES = {
  file: ZIP_FILE_LOCATION,
  appVersionId: APP_VERSION_ID_TO_ENTER,
};

export default class Push extends BaseCommand {
  static description = PUSH_COMMAND_DESCRIPTION;

  static examples = ['<%= config.bin %> <%= command.id %> -f ZIP FILE PATH -v VERSION TO PUSH '];

  static flags = {
    ...BaseCommand.globalFlags,
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
      Logger.error(ACCESS_TOKEN_NOT_FOUND);
      return;
    }

    const { flags } = await this.parse(Push);

    const args: PushCommandArguments = {
      filePath: flags.filePath || (await filePathPrompt()),
      appVersionId: flags.appVersionId || Number(await versionPrompt()),
    };
    const pushSpinner = createSpinner().start();
    try {
      if (
        fileExtensions &&
        fileExtensions.length > 0 &&
        !fileExtensions.includes(getFileExtension(args.filePath).toLowerCase())
      ) {
        throw new Error(`${PUSH_FILE_TO_UPLOAD_EXTENSIONS_ERROR} ${fileExtensions.join(',')}`);
      }

      const signedCloudStorageUrl = await getSignedStorageUrl(accessToken, args.appVersionId);
      const zipFileContent = readFileData(args.filePath);
      await uploadFileToStorage(signedCloudStorageUrl, zipFileContent, 'application/zip');
      pushSpinner.success({ text: SUCCESSFULLY_UPLOADING_ZIP_FILE });
    } catch (error: any) {
      logger.debug(error);
      pushSpinner.error({ text: `${ERROR_ON_UPLOADING_ZIP_FILE} due to "${(error as Error).message}"` });
    } finally {
      pushSpinner.clear();
    }
  }
}
