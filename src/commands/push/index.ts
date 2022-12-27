import { Flags } from '@oclif/core';
import { ConfigService } from '../../services/config-service.js';
import Logger from '../../utils/logger.js';
import { PromptService } from '../../services/prompt-service.js';
import { PushCommandArguments } from '../../types/commands/push.js';
import {
  createAppVersionDeploymentJob,
  getAppVersionStatus,
  getSignedStorageUrl,
  uploadFileToStorage,
} from '../../services/push-service.js';
import { createSpinner } from 'nanospinner';
import {
  ACCESS_TOKEN_NOT_FOUND,
  APP_VERSION_ID_TO_ENTER,
  PUSH_COMMAND_DESCRIPTION,
  SUCCESSFULLY_UPLOADING_ZIP_FILE,
  ZIP_FILE_LOCATION,
  PUSH_FILE_TO_UPLOAD_EXTENSIONS_ERROR,
  SUCCESSFULLY_DEPLOYED,
  ERROR_ON_DEPLOYMENT_URL_IS_MISSING,
  ERROR_ON_DEPLOYMENT,
  UPLOADING_ZIP_FILE,
  SIGNING_ZIP_FILE_LOCATION,
} from '../../consts/messages.js';
import { getFileExtension, readFileData } from '../../services/files-service.js';
import logger from '../../utils/logger.js';
import { BaseCommand } from '../base-command.js';
import { DEPLOYMENT_STATUS_TYPES } from '../../types/services/push-service.js';

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
    const pushSpinnerLogDeploymentStatus = (message: string) => {
      pushSpinner.update({ text: message });
    };

    try {
      if (
        fileExtensions &&
        fileExtensions.length > 0 &&
        !fileExtensions.includes(getFileExtension(args.filePath).toLowerCase())
      ) {
        throw new Error(`${PUSH_FILE_TO_UPLOAD_EXTENSIONS_ERROR} ${fileExtensions.join(',')}`);
      }

      pushSpinnerLogDeploymentStatus(SIGNING_ZIP_FILE_LOCATION);
      const signedCloudStorageUrl = await getSignedStorageUrl(accessToken, args.appVersionId);
      const zipFileContent = readFileData(args.filePath);
      pushSpinnerLogDeploymentStatus(UPLOADING_ZIP_FILE);
      await uploadFileToStorage(signedCloudStorageUrl, zipFileContent, 'application/zip');
      pushSpinnerLogDeploymentStatus(SUCCESSFULLY_UPLOADING_ZIP_FILE);
      const appVersionDeploymentJob = await createAppVersionDeploymentJob(accessToken, args.appVersionId);
      const appVersionStatus = await getAppVersionStatus(
        accessToken,
        args.appVersionId,
        appVersionDeploymentJob.retryAfter!,
        pushSpinnerLogDeploymentStatus,
      );
      if (appVersionStatus.status === DEPLOYMENT_STATUS_TYPES.failed) {
        pushSpinner.error({ text: appVersionStatus.error?.message || ERROR_ON_DEPLOYMENT });
      } else if (appVersionStatus.deployment) {
        const deploymentUrl = `${SUCCESSFULLY_DEPLOYED}${appVersionStatus.deployment.url}`;
        pushSpinner.success({ text: deploymentUrl });
      } else {
        pushSpinner.error({ text: ERROR_ON_DEPLOYMENT_URL_IS_MISSING });
      }
    } catch (error: any) {
      logger.debug(error);
      pushSpinner.error({ text: `${ERROR_ON_DEPLOYMENT} "${(error as Error).message}"` });
    } finally {
      pushSpinner.clear();
    }
  }
}
