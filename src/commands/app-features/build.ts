import { Flags } from '@oclif/core';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_VERSION_STATUS } from 'consts/app-versions';
import { APP_FEATURE_ID_TO_ENTER, APP_ID_TO_ENTER, APP_VERSION_ID_TO_ENTER, BUILD_ID_TO_ENTER } from 'consts/messages';
import { defaultVersionByAppId } from 'services/app-versions-service';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { createAppFeatureRelease } from 'src/services/app-features-service';
import { PromptService } from 'src/services/prompt-service';
import { BUILD_TYPES } from 'src/types/services/app-features-service';
import logger from 'utils/logger';

const MESSAGES = {
  appVersionId: APP_VERSION_ID_TO_ENTER,
  appId: APP_ID_TO_ENTER,
  appFeatureId: APP_FEATURE_ID_TO_ENTER,
  build: BUILD_ID_TO_ENTER,
  force: 'Force push to live version',
};

export default class Build extends AuthenticatedCommand {
  static description = 'Create an app feature build.';
  static examples = [
    '<%= config.bin %> <%= command.id %> -a APP_ID -i APP_VERSION_ID -d APP_FEATURE_ID  -t BUILD_TYPE -u CUSTOM_URL',
  ];

  static flags = Build.serializeFlags({
    appId: Flags.integer({
      char: 'a',
      description: MESSAGES.appId,
    }),
    appVersionId: Flags.integer({
      char: 'i',
      aliases: ['v'],
      description: MESSAGES.appVersionId,
    }),
    appFeatureId: Flags.integer({
      char: 'd',
      aliases: ['featureId'],
      description: MESSAGES.appFeatureId,
    }),
    buildType: Flags.string({
      char: 't',
      description: 'Build type',
      options: [BUILD_TYPES.CUSTOM_URL, BUILD_TYPES.MONDAY_CODE],
    }),
    customUrl: Flags.string({
      char: 'u',
      description: 'Custom url',
    }),
    force: Flags.boolean({
      char: 'f',
      description: MESSAGES.force,
    }),
  });

  static args = {};
  DEBUG_TAG = 'app-feature_build';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Build);
    let appVersionId: number | undefined;
    let appFeatureId: number | undefined = flags.appFeatureId;
    let buildType: string | undefined = flags.buildType;
    let customUrl: string | undefined = flags.customUrl;
    let appId = flags.appId;
    const force = flags.force;
    try {
      if (appId) {
        const latestDraftVersion = await defaultVersionByAppId(Number(appId), force);
        if (!latestDraftVersion) throw new Error('No editable version found for the given app id.');
        appVersionId = latestDraftVersion.id;
      } else {
        appVersionId = flags.appVersionId;
      }

      if (!appVersionId) {
        const allowedStatuses = force
          ? [APP_VERSION_STATUS.DRAFT, APP_VERSION_STATUS.LIVE]
          : [APP_VERSION_STATUS.DRAFT];
        const appAndAppVersion = await DynamicChoicesService.chooseAppAndAppVersion(allowedStatuses);
        appVersionId = appAndAppVersion.appVersionId;
        appId = appAndAppVersion.appId;
      }

      if (!appFeatureId) {
        appFeatureId = Number(await DynamicChoicesService.chooseAppFeature(appVersionId));
      }

      if (!buildType) {
        const buildTypeKey = (await PromptService.promptSelectionWithAutoComplete<string>(
          'Choose build type',
          Object.keys(BUILD_TYPES),
        )) as keyof typeof BUILD_TYPES;
        buildType = BUILD_TYPES[buildTypeKey];
      }

      if (!appId) {
        logger.error(`No app id provided`);
        return process.exit(0);
      }

      if (!customUrl) {
        const isCustomUrl = buildType === BUILD_TYPES.CUSTOM_URL;
        const promptMessage = isCustomUrl ? 'Add your custom url' : 'Add your route to monday-code base url';
        customUrl = await PromptService.promptInput(promptMessage, isCustomUrl);
      }

      this.preparePrintCommand(this, { appVersionId, appFeatureId, customUrl });
      const appFeature = await createAppFeatureRelease({
        appId,
        appFeatureId,
        appVersionId,
        customUrl,
        buildType: buildType as BUILD_TYPES,
      });
      logger.info(
        `App feature ${appFeatureId} was updated successfully with url: ${appFeature.current_release?.data?.url || ''}`,
        this.DEBUG_TAG,
      );
      process.exit(0);
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);

      // need to signal to the parent process that the command failed
      process.exit(1);
    }
  }
}
