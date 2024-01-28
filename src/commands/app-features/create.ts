import { Flags } from '@oclif/core';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_ID_TO_ENTER, APP_VERSION_ID_TO_ENTER } from 'consts/messages';
import { createAppFeature } from 'services/app-features-service';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { PromptService } from 'services/prompt-service';
import { AppFeatureType } from 'types/services/app-features-service';
import logger from 'utils/logger';

const MESSAGES = {
  appVersionId: APP_VERSION_ID_TO_ENTER,
  appId: APP_ID_TO_ENTER,
  featureType: 'Feature type',
  featureName: 'Feature name',
};

export default class Create extends AuthenticatedCommand {
  static description = 'Create an app feature.';
  static examples = ['<%= config.bin %> <%= command.id %> -a APP_ID -i APP_VERSION_ID -t APP-FEATURE-TYPE'];
  static flags = Create.serializeFlags({
    appId: Flags.integer({
      char: 'a',
      aliases: ['appId'],
      description: MESSAGES.appId,
    }),
    appVersionId: Flags.integer({
      char: 'i',
      aliases: ['versionId'],
      description: MESSAGES.appVersionId,
    }),
    featureType: Flags.string({
      char: 't',
      description: MESSAGES.featureType,
    }),
    featureName: Flags.string({
      char: 'n',
      description: MESSAGES.featureName,
    }),
  });

  static args = {};
  DEBUG_TAG = 'app-feature-create';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Create);
    let appVersionId = flags.appVersionId;
    let appId = flags.appId;
    let appFeatureType = flags.featureType;
    let appFeatureName = flags.featureName;

    try {
      if (!appVersionId) {
        const appAndAppVersion = await DynamicChoicesService.chooseAppAndAppVersion(false, false, {
          appId,
          autoSelectVersion: false,
        });
        appVersionId = appAndAppVersion.appVersionId;
        appId = appAndAppVersion.appId;
      }

      if (!appFeatureType) {
        appFeatureType = await DynamicChoicesService.chooseAppFeatureType([AppFeatureType.AppFeatureOauth]);
      }

      if (!appFeatureName) {
        appFeatureName = await PromptService.promptInput('Please enter feature name');
      }

      if (
        !(Object.values(AppFeatureType) as string[]).includes(appFeatureType) ||
        appFeatureType === (AppFeatureType.AppFeatureOauth as string)
      ) {
        logger.error(`Invalid feature type`);
        return process.exit(0);
      }

      if (!appId || !appVersionId || !appFeatureType) {
        logger.error(`missing required flags`);
        return process.exit(0);
      }

      this.preparePrintCommand(this, { appId, appVersionId });

      const createdAppFeature = await createAppFeature({
        appId,
        appVersionId,
        appFeatureType,
        options: { name: appFeatureName },
      });

      logger.info(
        `App feature ${createdAppFeature.name} created successfully with id ${createdAppFeature.id}`,
        this.DEBUG_TAG,
      );
      process.exit(0);
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);

      process.exit(1);
    }
  }
}
