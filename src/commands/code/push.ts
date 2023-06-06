import { Flags } from '@oclif/core';
import { Listr } from 'listr2';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_VERSION_ID_TO_ENTER } from 'consts/messages';
import { PromptService } from 'services/prompt-service';
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
};

export default class Push extends AuthenticatedCommand {
  static description = 'Push your project to get hosted on monday-code.';

  static examples = [
    '<%= config.bin %> <%= command.id %> -d PROJECT DIRECTORY PATH -i APP_VERSION_ID_TO_PUSH',
    '<%= config.bin %> <%= command.id %> -i APP_VERSION_ID_TO_PUSH',
  ];

  static flags = Push.serializeFlags({
    directoryPath: Flags.string({
      char: 'd',
      description: MESSAGES.directory,
    }),
    appVersionId: Flags.integer({
      char: 'i',
      description: MESSAGES.appVersionId,
    }),
  });

  static args = {};

  public async run(): Promise<void> {
    const { flags } = await this.parse(Push);

    const appVersionId = flags.appVersionId || Number(await PromptService.appVersionPrompt());

    const tasks = new Listr<PushCommandTasksContext>(
      [
        { title: 'Build asset to deploy', task: buildAssetToDeployTask(flags.directoryPath) },
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
      { ctx: { appVersionId } },
    );

    try {
      await tasks.run();
    } catch (error: any) {
      logger.debug(error);
    }
  }
}
