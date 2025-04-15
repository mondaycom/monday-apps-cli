import { Flags } from '@oclif/core';

import { AuthenticatedCommand } from '../../commands-base/authenticated-command';
import { APP_ID_TO_ENTER } from '../../consts/messages';
import { DynamicChoicesService } from '../../services/dynamic-choices-service';
import { SchedulerService } from '../../services/scheduler-service';
import logger from '../../utils/logger';

const MESSAGES = {
  appId: APP_ID_TO_ENTER,
};

export default class SchedulerList extends AuthenticatedCommand {
  static description = 'List all scheduler jobs for an app';
  static examples = ['<%= config.bin %> <%= command.id %> -a APP_ID'];

  static flags = {
    appId: Flags.string({
      char: 'a',
      description: MESSAGES.appId,
    }),
  };

  static args = {};

  DEBUG_TAG = 'scheduler_list';

  public async run(): Promise<void> {
    const { flags } = await this.parse(SchedulerList);

    try {
      const appId = flags.appId ? Number(flags.appId) : await DynamicChoicesService.chooseApp();

      logger.debug(`Listing scheduler jobs for appId: ${appId}`, this.DEBUG_TAG);
      this.preparePrintCommand(this, { appId });

      const jobs = await SchedulerService.listJobs(appId);

      if (jobs.length === 0) {
        this.log('No scheduler jobs found.');
        return;
      }

      this.log('\nScheduler Jobs:');
      for (const job of jobs) {
        this.log(`\nName: ${job.name}`);
        this.log(`Schedule: ${job.schedule}`);
        this.log(`Target URL: ${job.targetUrl}`);
        if (job.retryConfig) {
          this.log(
            `Retry Config: ${job.retryConfig.maxRetries} retries, ${job.retryConfig.minBackoffDuration}s backoff`,
          );
        }

        if (job.timeout) {
          this.log(`Timeout: ${job.timeout}s`);
        }
      }
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);
      process.exit(1);
    }
  }
}
