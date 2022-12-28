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
import { ACCESS_TOKEN_NOT_FOUND } from '../../consts/messages.js';
import { getFileExtension, readFileData } from '../../services/files-service.js';
import logger from '../../utils/logger.js';
import { BaseCommand } from '../base-command.js';
import { deploymentStatusTypesSchema } from '../../services/schemas/push-service-schemas.js';

export const ERROR_ON_DEPLOYMENT = 'Deployment process failed.';
export const ZIP_FILE_LOCATION = 'Please type the zip file path on your machine.';
export const APP_VERSION_ID_TO_ENTER = 'Please enter the app version id';

const fileExtensions = ['zip'];
const filePathPrompt = async () => PromptService.promptFile(ZIP_FILE_LOCATION, fileExtensions);

const versionPrompt = async () => PromptService.promptInputNumber(APP_VERSION_ID_TO_ENTER, true);

const MESSAGES = {
  file: ZIP_FILE_LOCATION,
  appVersionId: APP_VERSION_ID_TO_ENTER,
};

export default class Push extends BaseCommand {
  static description = 'Push your code to get hosted on monday-code.';

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
        throw new Error(`The process supports those file extensions: ${fileExtensions.join(',')}`);
      }

      pushSpinnerLogDeploymentStatus('Building zip file remote location.');
      const signedCloudStorageUrl = await getSignedStorageUrl(accessToken, args.appVersionId);
      const zipFileContent = readFileData(args.filePath);
      pushSpinnerLogDeploymentStatus('Uploading zip file.');
      await uploadFileToStorage(signedCloudStorageUrl, zipFileContent, 'application/zip');
      pushSpinnerLogDeploymentStatus('Zip file uploaded successful, starting the deployment.');
      const appVersionDeploymentJob = await createAppVersionDeploymentJob(accessToken, args.appVersionId);
      const appVersionStatus = await getAppVersionStatus(
        accessToken,
        args.appVersionId,
        appVersionDeploymentJob.retryAfter!,
        pushSpinnerLogDeploymentStatus,
      );
      if (appVersionStatus.status === deploymentStatusTypesSchema.enum.failed) {
        pushSpinner.error({ text: appVersionStatus.error?.message || ERROR_ON_DEPLOYMENT });
      } else if (appVersionStatus.deployment) {
        const deploymentUrl = `Deployment successfully finished, deployment url: ${appVersionStatus.deployment.url}`;
        pushSpinner.success({ text: deploymentUrl });
      } else {
        pushSpinner.error({ text: 'Something went wrong, the deployment url is missing.' });
      }
    } catch (error: any) {
      logger.debug(error);
      pushSpinner.error({ text: `${ERROR_ON_DEPLOYMENT} "${(error as Error).message}"` });
    } finally {
      pushSpinner.clear();
    }
  }
}
