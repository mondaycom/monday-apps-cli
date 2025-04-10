import { Flags } from '@oclif/core';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_ID_TO_ENTER, APP_VERSION_ID_TO_ENTER } from 'consts/messages';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { getCurrentWorkingDirectory } from 'services/env-service';
import { validateIfCanBuild } from 'services/files-service';
import { getTasksForClientSide, getTasksForServerSide } from 'services/share/deploy';
import logger from 'utils/logger';
import { addRegionToFlags, chooseRegionIfNeeded, getRegionFromString } from 'utils/region';

const MESSAGES = {
  directory: 'Directory path of you project in your machine. If not included will use the current working directory.',
  appVersionId: APP_VERSION_ID_TO_ENTER,
  appId: APP_ID_TO_ENTER,
  force: 'Force push to live version',
  'client-side': 'Push files to CDN',
};

export default class Push extends AuthenticatedCommand {
  static description = 'Push your project to get hosted on monday-code.';
  static examples = [
    '<%= config.bin %> <%= command.id %> -d PROJECT DIRECTORY PATH -i APP_VERSION_ID_TO_PUSH',
    '<%= config.bin %> <%= command.id %> -i APP_VERSION_ID_TO_PUSH',
    '<%= config.bin %> <%= command.id %> -a APP_ID_TO_PUSH',
  ];

  static flags = Push.serializeFlags(
    addRegionToFlags({
      directoryPath: Flags.string({
        char: 'd',
        description: MESSAGES.directory,
      }),
      appId: Flags.string({
        char: 'a',
        description: MESSAGES.appId,
      }),
      appVersionId: Flags.integer({
        char: 'i',
        aliases: ['v'],
        description: MESSAGES.appVersionId,
      }),
      force: Flags.boolean({
        char: 'f',
        description: MESSAGES.force,
      }),
      'client-side': Flags.boolean({
        char: 'c',
        description: MESSAGES['client-side'],
      }),
    }),
  );

  static args = {};
  DEBUG_TAG = 'code_push';

  public async handleCdnUpload(directoryPath?: string): Promise<void> {
    const { appVersionId } = await DynamicChoicesService.chooseAppAndAppVersion(false, false, {
      autoSelectVersion: true,
    });
    logger.info('Deploying build to CDN...');
    await getTasksForClientSide(Number(appVersionId), directoryPath || getCurrentWorkingDirectory()).run();
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Push);
    const { directoryPath, region: strRegion, 'client-side': clientSide } = flags;
    const region = getRegionFromString(strRegion);
    let appVersionId = flags.appVersionId;

    if (clientSide) {
      await this.handleCdnUpload(directoryPath);
      process.exit(0);
    }

    validateIfCanBuild(directoryPath || getCurrentWorkingDirectory());

    try {
      if (!appVersionId) {
        const force = flags.force;
        const appId = flags.appId;
        const appAndAppVersion = await DynamicChoicesService.chooseAppAndAppVersion(false, Boolean(force), {
          appId: Number(appId),
          autoSelectVersion: true,
        });

        appVersionId = appAndAppVersion.appVersionId;
      }

      const selectedRegion = await chooseRegionIfNeeded(region, { appVersionId });

      logger.debug(`push code to appVersionId: ${appVersionId}`, this.DEBUG_TAG);
      this.preparePrintCommand(this, { appVersionId, directoryPath: directoryPath });

      const tasks = getTasksForServerSide(appVersionId, directoryPath, selectedRegion);

      await tasks.run();
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);

      // need to signal to the parent process that the command failed
      process.exit(1);
    }
  }
}
