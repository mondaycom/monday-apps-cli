import { Flags } from '@oclif/core';
import { StatusCodes } from 'http-status-codes';

import Status from 'commands/code/status';
import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_VERSION_ID_TO_ENTER } from 'consts/messages';
import { listAppBuilds } from 'services/app-builds-service';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { AppRelease } from 'services/schemas/app-releases-schema';
import { HttpError } from 'types/errors';
import logger from 'utils/logger';

const printBuilds = (appBuilds: Array<AppRelease>) => {
  const appBuildsTable = appBuilds.map(appBuild => {
    return {
      id: appBuild.id,
      kind: appBuild.kind,
      category: appBuild.category,
      ...(appBuild.data?.liveUrl && { 'live url': appBuild.data?.liveUrl }),
      ...(appBuild.data?.url && { url: appBuild.data?.url }),
      ...(appBuild.data?.latestUrl && { 'static url (latest deployment)': appBuild.data?.latestUrl }),
      ...(appBuild.data?.deploymentState && { 'deployment state': appBuild.data?.deploymentState }),
      ...(appBuild.data?.sourceUrl && { 'source url (download)': appBuild.data?.sourceUrl }),
      ...(appBuild.data?.microFrontendName && { 'micro frontend name': appBuild.data?.microFrontendName }),
    };
  });

  logger.table(appBuildsTable);
};

export default class AppVersionBuilds extends AuthenticatedCommand {
  static description = 'List all builds for a specific app version';
  static examples = ['<%= config.bin %> <%= command.id %> -i APP_VERSION_ID'];
  static flags = AppVersionBuilds.serializeFlags({
    appVersionId: Flags.integer({
      char: 'i',
      aliases: ['v'],
      description: APP_VERSION_ID_TO_ENTER,
    }),
  });

  DEBUG_TAG = 'app_version_builds';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Status);
    let appVersionId = flags.appVersionId;
    if (!appVersionId) {
      const appAndAppVersion = await DynamicChoicesService.chooseAppAndAppVersion();
      appVersionId = appAndAppVersion.appVersionId;
    }

    try {
      this.preparePrintCommand(this, { appVersionId });
      const appReleases = await listAppBuilds(appVersionId);
      printBuilds(appReleases);
    } catch (error: unknown) {
      if (error instanceof HttpError && error.code === StatusCodes.NOT_FOUND) {
        logger.error(`No builds found for provided app version id - "${appVersionId}"`);
      } else {
        logger.error(`An unknown error happened while fetching builds for app version id - "${appVersionId}"`);
      }

      process.exit(0);
    }
  }
}
