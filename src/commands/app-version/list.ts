import { Flags } from '@oclif/core';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_ID_TO_ENTER } from 'consts/messages';
import { listAppVersionsByAppId } from 'services/app-versions-service';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { AppVersion } from 'types/services/app-versions-service';
import logger from 'utils/logger';

const printAppVersions = (appVersions: Array<AppVersion>) => {
  logger.table(appVersions);
};

export default class AppVersionList extends AuthenticatedCommand {
  static description = 'List all versions for a specific app.';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = AppVersionList.serializeFlags({
    appId: Flags.integer({
      char: 'i',
      description: APP_ID_TO_ENTER,
    }),
  });

  public async run(): Promise<void> {
    const { flags } = await this.parse(AppVersionList);

    let appId = flags.appId;
    if (!appId) {
      appId = Number(await DynamicChoicesService.chooseApp());
    }

    try {
      const appVersions = await listAppVersionsByAppId(appId);
      if (appVersions.length === 0) {
        logger.error(`No app versions found for provided app id - "${appId}"`);
        return this.exit(1);
      }

      printAppVersions(appVersions);
    } catch (error: unknown) {
      logger.debug(error);
      logger.error(`An unknown error happened while fetching app version for app id - "${appId}"`);
      this.exit(0);
    }
  }
}
