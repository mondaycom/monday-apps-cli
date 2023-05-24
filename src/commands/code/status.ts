import { Flags } from '@oclif/core';
import { StatusCodes } from 'http-status-codes';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_VERSION_ID_TO_ENTER } from 'consts/messages';
import { PromptService } from 'services/prompt-service';
import { getAppVersionDeploymentStatus } from 'services/push-service';
import { ErrorMondayCode } from 'types/errors';
import { AppVersionDeploymentStatus } from 'types/services/push-service';
import logger from 'utils/logger';

const printDeploymentStatus = (appVersionId: number, deploymentStatus: AppVersionDeploymentStatus) => {
  const { deployment, status, error } = deploymentStatus;
  const url: string | undefined = deployment?.url || 'none';
  const errorMessage: string | undefined = error?.message;
  const tableData = {
    id: appVersionId,
    status,
    ...(url && { url }),
    ...(errorMessage && { errorMessage }),
  };

  logger.table([tableData]);
};

export default class Status extends AuthenticatedCommand {
  static description = 'Status of a specific project hosted on monday-code.';

  static examples = ['<%= config.bin %> <%= command.id %> -i APP_VERSION_ID'];

  static flags = Status.serializeFlags({
    appVersionId: Flags.integer({
      char: 'i',
      description: APP_VERSION_ID_TO_ENTER,
    }),
  });

  public async run(): Promise<void> {
    const { flags } = await this.parse(Status);
    const appVersionId = flags.appVersionId || Number(await PromptService.appVersionPrompt());
    try {
      const deploymentStatus = await getAppVersionDeploymentStatus(appVersionId);
      printDeploymentStatus(appVersionId, deploymentStatus);
    } catch (error: unknown) {
      if (error instanceof ErrorMondayCode && error.code === StatusCodes.NOT_FOUND) {
        logger.error(`Not deployment found for provided app version id - "${appVersionId}"`);
      } else {
        logger.error(
          `An unknown error happened while fetching deployment status for app version id - "${appVersionId}"`,
        );
      }

      this.exit(0);
    }
  }
}
