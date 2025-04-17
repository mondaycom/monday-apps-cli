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

  static flags = SchedulerList.serializeFlags({
    appId: Flags.integer({
      char: 'a',
      description: MESSAGES.appId,
    }),
  });

  DEBUG_TAG = 'scheduler_list';

  public async run(): Promise<void> {
    const { flags } = await this.parse(SchedulerList);

    try {
      const appId = flags.appId ? Number(flags.appId) : await DynamicChoicesService.chooseApp();

      logger.debug(`Listing scheduler jobs for appId: ${appId}`, this.DEBUG_TAG);
      this.preparePrintCommand(this, { appId });

      const jobs = await SchedulerService.listJobs(appId);
      SchedulerService.printJobs(jobs, this.log.bind(this));
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);
      process.exit(1);
    }
  }
}
