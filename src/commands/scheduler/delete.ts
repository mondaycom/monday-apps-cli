import { Flags } from '@oclif/core';

import { PromptService } from 'src/services/prompt-service';

import { AuthenticatedCommand } from '../../commands-base/authenticated-command';
import { APP_ID_TO_ENTER } from '../../consts/messages';
import { DynamicChoicesService } from '../../services/dynamic-choices-service';
import { SchedulerService } from '../../services/scheduler-service';
import logger from '../../utils/logger';

const MESSAGES = {
  appId: APP_ID_TO_ENTER,
  jobName: 'Name of the job to delete',
};

export default class SchedulerDelete extends AuthenticatedCommand {
  static description = 'Delete a scheduler job for an app';
  static examples = ['<%= config.bin %> <%= command.id %> -a APP_ID -j "my-job"'];

  static flags = SchedulerDelete.serializeFlags({
    appId: Flags.integer({
      char: 'a',
      description: MESSAGES.appId,
    }),
    jobName: Flags.string({
      char: 'n',
      description: MESSAGES.jobName,
    }),
  });

  DEBUG_TAG = 'scheduler_delete';

  public async run(): Promise<void> {
    const { flags } = await this.parse(SchedulerDelete);
    let { appId, jobName } = flags;

    try {
      if (!appId) appId = await DynamicChoicesService.chooseApp();
      if (!jobName) jobName = await PromptService.promptInput(MESSAGES.jobName, true);

      logger.debug(`Deleting scheduler job ${jobName} for appId: ${appId}`, this.DEBUG_TAG);
      this.preparePrintCommand(this, {
        appId,
        jobName,
      });

      await SchedulerService.deleteJob(appId, jobName);
      logger.info(`Successfully deleted job: ${jobName}`);
    } catch (error: any) {
      console.log(error);
      logger.debug(error, this.DEBUG_TAG);
      process.exit(1);
    }
  }
}
