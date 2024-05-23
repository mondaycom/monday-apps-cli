import { Flags } from '@oclif/core';
import { StatusCodes } from 'http-status-codes';

import { addRegionToFlags, chooseRegionIfNeeded } from 'commands/utils/region';
import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_VERSION_ID_TO_ENTER, VAR_UNKNOWN } from 'consts/messages';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { getAppVersionDeploymentStatus } from 'services/push-service';
import { getMondayCodeBuild } from 'src/services/app-builds-service';
import { HttpError } from 'types/errors';
import { Region } from 'types/general/region';
import { AppVersionDeploymentStatus } from 'types/services/push-service';
import logger from 'utils/logger';
import { getRegionFromString } from 'utils/region';

const printDeploymentStatus = (
  appVersionId: number,
  deploymentStatus: Pick<AppVersionDeploymentStatus, 'deployment' | 'status' | 'error'>,
) => {
  const { deployment, status, error } = deploymentStatus;
  const url = deployment?.url || 'none';
  const liveUrl = deployment?.liveUrl;
  const errorMessage: string | undefined = error?.message;
  const tableData = {
    id: appVersionId,
    status,
    url,
    ...(liveUrl && { liveUrl }),
    ...(errorMessage && { errorMessage }),
  };

  logger.table([tableData]);
};

export default class Status extends AuthenticatedCommand {
  static description = 'Status of a specific project hosted on monday-code.';

  static examples = ['<%= config.bin %> <%= command.id %> -i APP_VERSION_ID'];

  static flags = Status.serializeFlags(
    addRegionToFlags({
      appVersionId: Flags.integer({
        char: 'i',
        aliases: ['v'],
        description: APP_VERSION_ID_TO_ENTER,
      }),
    }),
  );

  public async run(): Promise<void> {
    const { flags } = await this.parse(Status);
    const { region: strRegion } = flags;
    const region = getRegionFromString(strRegion);
    let appVersionId = flags.appVersionId;
    try {
      if (!appVersionId) {
        const appAndAppVersion = await DynamicChoicesService.chooseAppAndAppVersion(true, true);
        appVersionId = appAndAppVersion.appVersionId;
      }

      const selectedRegion = await chooseRegionIfNeeded(region, { appVersionId });

      this.preparePrintCommand(this, { appVersionId });
      const deploymentStatus = await getAppVersionDeploymentStatus(appVersionId, selectedRegion);
      const mondayCodeRelease = await getMondayCodeBuild(appVersionId, selectedRegion);

      if (deploymentStatus.deployment) {
        deploymentStatus.deployment.liveUrl = mondayCodeRelease?.data?.liveUrl;
      }

      printDeploymentStatus(appVersionId, deploymentStatus);
    } catch (error: unknown) {
      if (error instanceof HttpError && error.code === StatusCodes.NOT_FOUND) {
        logger.error(`No deployment found for provided app version id - "${appVersionId || VAR_UNKNOWN}"`);
      } else {
        logger.error(
          `An unknown error happened while fetching deployment status for app version id - "${
            appVersionId || VAR_UNKNOWN
          }"`,
        );
      }

      process.exit(1);
    }
  }
}
