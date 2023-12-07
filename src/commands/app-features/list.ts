import { Flags } from '@oclif/core';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_ID_TO_ENTER, APP_VERSION_ID_TO_ENTER } from 'consts/messages';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { listAppFeaturesByAppVersionId } from 'src/services/app-features-service';
import { AppFeature } from 'src/types/services/app-features-service';
import logger from 'utils/logger';

const printAppFeatures = (appVersions: Array<AppFeature>) => {
  logger.table(appVersions);
};

export default class AppFeatureList extends AuthenticatedCommand {
  DEBUG_TAG = 'app_feature_list';

  static description = 'List all features for a specific app version.';

  static examples = ['<%= config.bin %> <%= command.id %> -a APP_ID -i APP_VERSION_ID'];

  static flags = AppFeatureList.serializeFlags({
    appId: Flags.integer({
      char: 'a',
      description: APP_ID_TO_ENTER,
    }),
    appVersionId: Flags.integer({
      char: 'i',
      description: APP_VERSION_ID_TO_ENTER,
    }),
  });

  public async run(): Promise<void> {
    const { flags } = await this.parse(AppFeatureList);

    let appId = flags.appId;
    let appVersionId = flags.appVersionId;

    if (!appId && !appVersionId) {
      const appAndAppVersionIds = await DynamicChoicesService.chooseAppAndAppVersion();
      appVersionId = Number(appAndAppVersionIds.appVersionId);
      appId = Number(appAndAppVersionIds.appId);
    }

    if (!appVersionId && appId) {
      appVersionId = Number(await DynamicChoicesService.chooseAppVersion(appId));
    }

    if (!appVersionId) {
      logger.error(`No app version id provided`);
      return process.exit(0);
    }

    this.preparePrintCommand(this, { appId, appVersionId });
    const appFeatures = await listAppFeaturesByAppVersionId(appVersionId);
    if (!appFeatures || appFeatures.length === 0) {
      logger.error(`No app features found for provided app version id - "${appVersionId}"`);
      return process.exit(0);
    }

    const printableAppFeatures = appFeatures.map(appFeature => {
      return {
        id: appFeature.id,
        name: appFeature.name,
        type: appFeature.type,
        status: appFeature.status || 'active',
      };
    });

    printAppFeatures(printableAppFeatures);
  }
}
