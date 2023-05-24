import { Flags } from '@oclif/core';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_VERSION_ID_TO_ENTER } from 'consts/messages';
import { getCurrentWorkingDirectory } from 'services/env-service';
import { createTarGzArchive, readFileData } from 'services/files-service';
import { PromptService } from 'services/prompt-service';
import { getSignedStorageUrl, pollForDeploymentStatus, uploadFileToStorage } from 'services/push-service';
import { deploymentStatusTypesSchema } from 'services/schemas/push-service-schemas';
import { spinner } from 'services/spinner-service';
import { PushCommandArguments } from 'types/commands/push';
import { TimeInMs } from 'types/general/time';
import logger from 'utils/logger';

export const ERROR_ON_DEPLOYMENT = 'Deployment process has failed.';
export const DIRECTORY_TO_COMPRESS_LOCATION =
  'Directory path of you project in your machine. If not included will use the current working directory.';

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

export default class Push extends AuthenticatedCommand {
  static description = 'Push your project to get hosted on monday-code.';

  static examples = [
    '<%= config.bin %> <%= command.id %> -d PROJECT DIRECTORY PATH -i APP_VERSION_ID_TO_PUSH',
    '<%= config.bin %> <%= command.id %> -i APP_VERSION_ID_TO_PUSH',
  ];

  static flags = Push.serializeFlags({
    directoryPath: Flags.string({
      char: 'd',
      description: MESSAGES.directory,
    }),
    appVersionId: Flags.integer({
      char: 'i',
      description: MESSAGES.appVersionId,
    }),
  });

  static args = {};

  public async run(): Promise<void> {
    const { flags } = await this.parse(Push);

    const appVersionId = flags.appVersionId || Number(await PromptService.appVersionPrompt());
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
      const signedCloudStorageUrl = await getSignedStorageUrl(args.appVersionId);
      const archiveContent = readFileData(args.filePath);
      spinner.setText('Uploading project.');
      await uploadFileToStorage(signedCloudStorageUrl, archiveContent, 'application/zip');
      spinner.setText('Project uploaded successful, starting the deployment.');

      const deploymentStatus = await pollForDeploymentStatus(args.appVersionId, TimeInMs.second * 5, {
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
