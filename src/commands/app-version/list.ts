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
  DEBUG_TAG = 'app_version_list';

  static description = 'List all versions for a specific app.';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = AppVersionList.serializeFlags({
    appId: Flags.integer({
      char: 'i',
      aliases: ['a'],
      description: APP_ID_TO_ENTER,
    }),
  });

  public async run(): Promise<void> {
    const { flags } = await this.parse(AppVersionList);

    let appId = flags.appId;
    if (!appId) {
      appId = Number(await DynamicChoicesService.chooseApp());
    }

    this.preparePrintCommand(this, { appId });
    const appVersions = await listAppVersionsByAppId(appId);
    if (appVersions.length === 0) {
      logger.error(`No app versions found for provided app id - "${appId}"`);
      return process.exit(0);
    }

    printAppVersions(appVersions);
  }
}
