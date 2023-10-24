import { Flags } from '@oclif/core';
import { Listr } from 'listr2';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_VERSION_STATUS } from 'consts/app-versions';
import { APP_ID_TO_ENTER, APP_VERSION_ID_TO_ENTER } from 'consts/messages';
import { defaultVersionByAppId } from 'services/app-versions-service';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import {
  buildAssetToDeployTask,
  handleDeploymentTask,
  prepareEnvironmentTask,
  uploadAssetTask,
} from 'services/push-service';
import { PushCommandTasksContext } from 'types/commands/push';
import logger from 'utils/logger';

const MESSAGES = {
  directory: 'Directory path of you project in your machine. If not included will use the current working directory.',
  appVersionId: APP_VERSION_ID_TO_ENTER,
  appId: APP_ID_TO_ENTER,
};

export default class Push extends AuthenticatedCommand {
  static description = 'Push your project to get hosted on monday-code.';
  static examples = [
    '<%= config.bin %> <%= command.id %> -d PROJECT DIRECTORY PATH -i APP_VERSION_ID_TO_PUSH',
    '<%= config.bin %> <%= command.id %> -i APP_VERSION_ID_TO_PUSH',
    '<%= config.bin %> <%= command.id %> -a APP_ID_TO_PUSH',
  ];

  static flags = Push.serializeFlags({
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
  });

  static args = {};
  DEBUG_TAG = 'code_push';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Push);
    let appVersionId;

    const appId = flags.appId;
    if (appId) {
      const latestDraftVersion = await defaultVersionByAppId(Number(appId));
      if (!latestDraftVersion) throw new Error('No draft version found for the given app id.');
      appVersionId = latestDraftVersion.id;
    } else {
      appVersionId = flags.appVersionId;
    }

    if (!appVersionId) {
      const appAndAppVersion = await DynamicChoicesService.chooseAppAndAppVersion([APP_VERSION_STATUS.DRAFT]);
      appVersionId = appAndAppVersion.appVersionId;
    }

    logger.debug(`push code to appVersionId: ${appVersionId}`, this.DEBUG_TAG);
    this.preparePrintCommand(this, { appVersionId, directoryPath: flags.directoryPath });
    const tasks = new Listr<PushCommandTasksContext>(
      [
        { title: 'Build asset to deploy', task: buildAssetToDeployTask },
        {
          title: 'Preparing environment',
          task: prepareEnvironmentTask,
          enabled: ctx => Boolean(ctx.showPrepareEnvironmentTask),
        },
        {
          title: 'Uploading built asset',
          task: uploadAssetTask,
          enabled: ctx => Boolean(ctx.showUploadAssetTask),
        },
        {
          title: 'Deployment in progress',
          task: handleDeploymentTask,
          enabled: ctx => Boolean(ctx.showHandleDeploymentTask),
        },
      ],
      { ctx: { appVersionId, directoryPath: flags.directoryPath } },
    );

    try {
      await tasks.run();
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);
    }
  }
}
