import { Flags } from '@oclif/core';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_FEATURE_ID_TO_ENTER, APP_ID_TO_ENTER, APP_VERSION_ID_TO_ENTER, BUILD_ID_TO_ENTER } from 'consts/messages';
import { defaultVersionByAppId } from 'services/app-versions-service';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { createAppFeatureRelease } from 'src/services/app-features-service';
import { PromptService } from 'src/services/prompt-service';
import { AppFeature, AppFeatureType, BUILD_TYPES } from 'src/types/services/app-features-service';
import logger from 'utils/logger';

const MESSAGES = {
  appVersionId: APP_VERSION_ID_TO_ENTER,
  appId: APP_ID_TO_ENTER,
  appFeatureId: APP_FEATURE_ID_TO_ENTER,
  build: BUILD_ID_TO_ENTER,
  force: 'Force push to live version',
};

export default class Build extends AuthenticatedCommand {
  static description = 'Perform operations related to app features in monday.com';
  static examples = [
    '<%= config.bin %> <%= command.id %> -a APP_ID -i APP_VERSION_ID -d APP_FEATURE_ID  -t BUILD_TYPE -u CUSTOM_URL',
  ];

  static flags = Build.serializeFlags({
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
    appFeatureId: Flags.integer({
      char: 'd',
      aliases: ['featureId'],
      description: MESSAGES.appFeatureId,
    }),
    buildType: Flags.string({
      char: 't',
      aliases: ['type'],
      description: 'Build type',
      options: [BUILD_TYPES.CUSTOM_URL, BUILD_TYPES.MONDAY_CODE, BUILD_TYPES.MONDAY_CODE_CDN],
    }),
    customUrl: Flags.string({
      char: 'u',
      aliases: ['customUrl'],
      description: 'Custom url',
    }),
  });

  static args = {};
  DEBUG_TAG = 'app-feature_build';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Build);
    let appVersionId: number | undefined;
    let { appFeatureId } = flags;
    let { buildType } = flags;
    let { customUrl } = flags;
    let { appId } = flags;
    let appFeature: AppFeature;

    try {
      if (appId) {
        const latestDraftVersion = appVersionId ? { id: appVersionId } : await defaultVersionByAppId(Number(appId));
        if (!latestDraftVersion) throw new Error('No editable version found for the given app id.');
        appVersionId = latestDraftVersion.id;
      } else {
        appVersionId = flags.appVersionId;
      }

      if (!appVersionId) {
        const appAndAppVersion = await DynamicChoicesService.chooseAppAndAppVersion(false, false, {
          appId,
          autoSelectVersion: false,
        });
        appVersionId = appAndAppVersion.appVersionId;
        appId = appAndAppVersion.appId;
      }

      if (!appFeatureId) {
        appFeature = await DynamicChoicesService.chooseAppFeature(appVersionId, {
          excludeTypes: [AppFeatureType.AppFeatureSolution, AppFeatureType.AppFeatureColumnTemplate],
        });
        appFeatureId = appFeature.id;
      }

      if (!buildType) {
        const buildTypeKey = (await PromptService.promptSelectionWithAutoComplete<string>(
          'Choose build type',
          Object.keys(BUILD_TYPES),
        )) as keyof typeof BUILD_TYPES;
        buildType = BUILD_TYPES[buildTypeKey];
      }

      if (!appId || !appVersionId || !appFeatureId) {
        logger.error(`missing required flags`);
        return process.exit(0);
      }

      if (!customUrl) {
        const isCustomUrl = (buildType as BUILD_TYPES) === BUILD_TYPES.CUSTOM_URL;
        const promptMessage = isCustomUrl ? 'Add your custom url' : 'Add your route to monday-code base url';
        customUrl = await PromptService.promptInput(promptMessage, isCustomUrl);
      }

      this.preparePrintCommand(this, { appId, appVersionId, appFeatureId, customUrl });

      const updatedAppFeature = await createAppFeatureRelease({
        appId,
        appFeatureId,
        appVersionId,
        customUrl,
        buildType: buildType as BUILD_TYPES,
      });

      logger.info(
        `App feature ${appFeatureId} was updated successfully with url: ${
          updatedAppFeature.current_release?.data?.url || ''
        }`,
        this.DEBUG_TAG,
      );
      process.exit(0);
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);

      process.exit(1);
    }
  }
}
