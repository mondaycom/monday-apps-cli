import { Flags } from '@oclif/core';

import { ACCESS_TOKEN_NOT_FOUND, APP_VERSION_ID_TO_ENTER } from 'consts/messages';
import { ConfigService } from 'services/config-service';
import { getCurrentWorkingDirectory } from 'services/env-service';
import { createTarGzArchive, readFileData } from 'services/files-service';
import { PromptService } from 'services/prompt-service';
import { getDeploymentStatus, getSignedStorageUrl, uploadFileToStorage } from 'services/push-service';
import { spinner } from 'services/push-spinner-service';
import { deploymentStatusTypesSchema } from 'services/schemas/push-service-schemas';
import { PushCommandArguments } from 'types/commands/push';
import { TimeInMs } from 'types/general/time';
import logger from 'utils/logger';

import { BaseCommand } from '../base-command.js';

export const ERROR_ON_DEPLOYMENT = 'Deployment process has failed.';
export const DIRECTORY_TO_COMPRESS_LOCATION =
  'Directory path of you project in your machine. If not included will use the current working directory.';

const appVersionPrompt = async () => PromptService.promptInputNumber(APP_VERSION_ID_TO_ENTER, true);

const MESSAGES = {
  directory: DIRECTORY_TO_COMPRESS_LOCATION,
  appVersionId: APP_VERSION_ID_TO_ENTER,
};

const handleFileToUpload = async (directoryPath?: string): Promise<string | undefined> => {
  try {
    if (!directoryPath) {
      const currentDirectoryPath = getCurrentWorkingDirectory();
      logger.debug(`Directory path not provided using current directory: ${currentDirectoryPath}`);
      directoryPath = currentDirectoryPath;
    }

    spinner.setText(`Building asset to deploy from "${directoryPath}" directory`);
    spinner.start();
    const archivePath = await createTarGzArchive(directoryPath, 'code');
    return archivePath;
  } catch (error) {
    logger.debug(error);
    spinner.setError(`${ERROR_ON_DEPLOYMENT} "${(error as Error).message}"`);
  } finally {
    spinner.clear();
  }

  return;
};

export default class Push extends BaseCommand {
  static description = 'Push your project to get hosted on monday-code.';

  static examples = [
    '<%= config.bin %> <%= command.id %> -d PROJECT DIRECTORY PATH -i APP VERSION ID TO PUSH',
    '<%= config.bin %> <%= command.id %> -i APP VERSION ID TO PUSH',
  ];

  static flags = {
    ...BaseCommand.globalFlags,
    directoryPath: Flags.string({
      char: 'd',
      description: MESSAGES.directory,
    }),
    appVersionId: Flags.integer({
      char: 'i',
      description: MESSAGES.appVersionId,
    }),
  };

  static args = [];

  public async run(): Promise<void> {
    const accessToken = ConfigService.getConfigDataByKey('accessToken');
    if (!accessToken) {
      logger.error(ACCESS_TOKEN_NOT_FOUND);
      return;
    }

    const { flags } = await this.parse(Push);

    const appVersionId = flags.appVersionId || Number(await appVersionPrompt());
    const archivePath = await handleFileToUpload(flags.directoryPath);
    if (!archivePath) {
      return;
    }

    const args: PushCommandArguments = {
      filePath: archivePath,
      appVersionId,
    };

    spinner.start();
    try {
      spinner.setText('Building project remote location.');
      const signedCloudStorageUrl = await getSignedStorageUrl(accessToken, args.appVersionId);
      const archiveContent = readFileData(args.filePath);
      spinner.setText('Uploading project.');
      await uploadFileToStorage(signedCloudStorageUrl, archiveContent, 'application/zip');
      spinner.setText('Project uploaded successful, starting the deployment.');

      const deploymentStatus = await getDeploymentStatus(accessToken, args.appVersionId, TimeInMs.second * 5, {
        ttl: TimeInMs.minute * 30,
        progressLogger: (message: string) => {
          spinner.setText(message);
        },
      });
      if (deploymentStatus.status === deploymentStatusTypesSchema.enum.failed) {
        spinner.setError(deploymentStatus.error?.message || ERROR_ON_DEPLOYMENT);
      } else if (deploymentStatus.deployment) {
        const deploymentUrl = `Deployment successfully finished, deployment url: ${deploymentStatus.deployment.url}`;
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
