import { Flags } from '@oclif/core';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_ID_TO_ENTER, APP_VERSION_ID_TO_ENTER } from 'consts/messages';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { listAppFeaturesByAppVersionId } from 'src/services/app-features-service';
import { AppFeature } from 'src/types/services/app-features-service';
import logger from 'utils/logger';

const printAppFeatures = (appFeatures: Array<AppFeature>) => {
  logger.table(appFeatures);
};

export default class AppFeatureList extends AuthenticatedCommand {
  DEBUG_TAG = 'app_feature_list';

  static description = 'List all features for a specific app version.';

  static examples = ['<%= config.bin %> <%= command.id %> -a APP_ID -i APP_VERSION_ID'];

  static flags = AppFeatureList.serializeFlags({
    appId: Flags.integer({
      char: 'a',
      aliases: ['appId'],
      description: APP_ID_TO_ENTER,
    }),
    appVersionId: Flags.integer({
      char: 'i',
      aliases: ['versionId'],
      description: APP_VERSION_ID_TO_ENTER,
    }),
  });

  public async run(): Promise<void> {
    const { flags } = await this.parse(AppFeatureList);

    const appId = flags.appId;
    let appVersionId = flags.appVersionId;

    if (!appVersionId) {
      const appIdAndAppVersionId = await DynamicChoicesService.chooseAppAndAppVersion(undefined, appId);
      appVersionId = Number(appIdAndAppVersionId.appVersionId);
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
        build: appFeature.current_release?.data?.url || appFeature.data?.mircrofrontendName || 'N/A',
      };
    });

    printAppFeatures(printableAppFeatures);
  }
}
