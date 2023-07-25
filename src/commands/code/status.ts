import { Flags } from '@oclif/core';
import { StatusCodes } from 'http-status-codes';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_VERSION_ID_TO_ENTER } from 'consts/messages';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { getAppVersionDeploymentStatus } from 'services/push-service';
import { HttpError } from 'types/errors';
import { AppVersionDeploymentStatus } from 'types/services/push-service';
import logger from 'utils/logger';

const printDeploymentStatus = (appVersionId: number, deploymentStatus: AppVersionDeploymentStatus) => {
  const { deployment, status, error } = deploymentStatus;
  const url = deployment?.url || 'none';
  const latestUrl = deployment?.latestUrl || 'none';
  const errorMessage: string | undefined = error?.message;
  const tableData = {
    id: appVersionId,
    status,
    url,
    'static url (latest deployment)': latestUrl,
    ...(errorMessage && { errorMessage }),
  };

  logger.table([tableData]);
};

const DEBUG_TAG = 'code_status';

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
    let appVersionId = flags.appVersionId;
    if (!appVersionId) {
      const appAndAppVersion = await DynamicChoicesService.chooseAppAndAppVersion();
      appVersionId = appAndAppVersion.appVersionId;
    }

    try {
      const deploymentStatus = await getAppVersionDeploymentStatus(appVersionId);
      printDeploymentStatus(appVersionId, deploymentStatus);
    } catch (error: unknown) {
      logger.debug(error, DEBUG_TAG);
      if (error instanceof HttpError && error.code === StatusCodes.NOT_FOUND) {
        logger.error(`No deployment found for provided app version id - "${appVersionId}"`);
      } else {
        logger.error(
          `An unknown error happened while fetching deployment status for app version id - "${appVersionId}"`,
        );
      }

      this.exit(0);
    }
  }
}
