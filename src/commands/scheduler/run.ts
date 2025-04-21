import { Flags } from '@oclif/core';

import { AuthenticatedCommand } from '../../commands-base/authenticated-command';
import { APP_ID_TO_ENTER } from '../../consts/messages';
import { DynamicChoicesService } from '../../services/dynamic-choices-service';
import { SchedulerService } from '../../services/scheduler-service';
import logger from '../../utils/logger';

const MESSAGES = {
  appId: APP_ID_TO_ENTER,
  jobName: 'Name of the job to run',
};

export default class SchedulerRun extends AuthenticatedCommand {
  static description = 'Run a scheduler job for an app';
  static examples = ['<%= config.bin %> <%= command.id %> -a APP_ID -j "my-job"'];

  static flags = SchedulerRun.serializeFlags({
    appId: Flags.integer({
      char: 'a',
      description: MESSAGES.appId,
    }),
    jobName: Flags.string({
      char: 'n',
      description: MESSAGES.jobName,
    }),
  });

  DEBUG_TAG = 'scheduler_run';

  public async run(): Promise<void> {
    const { flags } = await this.parse(SchedulerRun);
    let { appId, jobName } = flags;

    try {
      if (!appId) appId = await DynamicChoicesService.chooseApp();
      if (!jobName) jobName = await DynamicChoicesService.chooseSchedulerJob(appId);

      logger.debug(`Running scheduler job ${jobName} for appId: ${appId}`, this.DEBUG_TAG);
      this.preparePrintCommand(this, {
        appId,
        jobName,
      });

      await SchedulerService.runJob(appId, jobName);
      logger.info(`Successfully triggered job: ${jobName}`);
    } catch (error: any) {
      console.log(error);
      logger.debug(error, this.DEBUG_TAG);
      process.exit(1);
    }
  }
}
