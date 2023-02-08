import { Flags } from '@oclif/core';
import { ConfigService } from '../../services/config-service.js';
import Logger from '../../utils/logger.js';
import { PromptService } from '../../services/prompt-service.js';
import { PushCommandArguments } from '../../types/commands/push.js';
import { getAppFeatureIdStatus, getSignedStorageUrl, uploadFileToStorage } from '../../services/push-service.js';
import { ACCESS_TOKEN_NOT_FOUND } from '../../consts/messages.js';
import { readFileData, createTarGzArchive } from '../../services/files-service.js';
import logger from '../../utils/logger.js';
import { BaseCommand } from '../base-command.js';
import { deploymentStatusTypesSchema } from '../../services/schemas/push-service-schemas.js';
import { spinner } from '../../services/push-spinner-service.js';
import { TimeInMs } from '../../types/general/time.js';
import { getCurrentWorkingDirectory } from '../../services/env-service.js';

export const ERROR_ON_DEPLOYMENT = 'Deployment process has failed.';
export const DIRECTORY_TO_COMPRESS_LOCATION =
  'Directory path of you project in your machine. If not included will use the current working directory.';
export const APP_FEATURE_ID_TO_ENTER = 'The app feature id of your app';

const appFeaturePrompt = async () => PromptService.promptInputNumber(APP_FEATURE_ID_TO_ENTER, true);

const MESSAGES = {
  directory: DIRECTORY_TO_COMPRESS_LOCATION,
  appFeatureId: APP_FEATURE_ID_TO_ENTER,
};

const handleFileToUpload = async (directoryPath?: string): Promise<string> => {
  if (!directoryPath) {
    const currentDirectoryPath = getCurrentWorkingDirectory();
    logger.debug(`Directory path not provided using current directory: ${currentDirectoryPath}`);
    directoryPath = currentDirectoryPath;
  }

  return createTarGzArchive(directoryPath, 'code');
};

export default class Push extends BaseCommand {
  static description = 'Push your project to get hosted on monday-code.';

  static examples = [
    '<%= config.bin %> <%= command.id %> -d PROJECT DIRECTORY PATH -i APP FEATURE ID TO PUSH',
    '<%= config.bin %> <%= command.id %> -i APP FEATURE ID TO PUSH',
  ];

  static flags = {
    ...BaseCommand.globalFlags,
    directoryPath: Flags.string({
      char: 'd',
      description: MESSAGES.directory,
    }),
    appFeatureId: Flags.integer({
      char: 'i',
      description: MESSAGES.appFeatureId,
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
      filePath: await handleFileToUpload(flags.directoryPath),
      appFeatureId: flags.appFeatureId || Number(await appFeaturePrompt()),
    };

    spinner.start();
    try {
      spinner.setText('Building project remote location.');
      const signedCloudStorageUrl = await getSignedStorageUrl(accessToken, args.appFeatureId);
      const archiveContent = readFileData(args.filePath);
      spinner.setText('Uploading project.');
      await uploadFileToStorage(signedCloudStorageUrl, archiveContent, 'application/zip');
      spinner.setText('Project uploaded successful, starting the deployment.');

      const appFeatureStatus = await getAppFeatureIdStatus(accessToken, args.appFeatureId, TimeInMs.second * 5, {
        ttl: TimeInMs.minute * 30,
        progressLogger: (message: string) => {
          spinner.setText(message);
        },
      });
      if (appFeatureStatus.status === deploymentStatusTypesSchema.enum.failed) {
        spinner.setError(appFeatureStatus.error?.message || ERROR_ON_DEPLOYMENT);
      } else if (appFeatureStatus.deployment) {
        const deploymentUrl = `Deployment successfully finished, deployment url: ${appFeatureStatus.deployment.url}`;
        spinner.setSuccess(deploymentUrl);
      } else {
        spinner.setError('Something went wrong, the deployment url is missing.');
      }
    } catch (error: any) {
      logger.debug(error);
      spinner.setError(`${ERROR_ON_DEPLOYMENT} "${(error as Error).message}"`);
    } finally {
      spinner.clear();
    }
  }
}
