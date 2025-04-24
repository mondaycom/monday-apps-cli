import { SchedulerBaseFlags } from './consts/flags';
import { AuthenticatedCommand } from '../../commands-base/authenticated-command';
import { DynamicChoicesService } from '../../services/dynamic-choices-service';
import { SchedulerService } from '../../services/scheduler-service';
import logger from '../../utils/logger';

export default class SchedulerDelete extends AuthenticatedCommand {
  static description = 'Delete a scheduler job for an app';
  static examples = ['<%= config.bin %> <%= command.id %> -a APP_ID -n "my-job"'];

  static flags = SchedulerDelete.serializeFlags(SchedulerBaseFlags);

  DEBUG_TAG = 'scheduler_delete';

  public async run(): Promise<void> {
    const { flags } = await this.parse(SchedulerDelete);
    let { appId, name } = flags;

    try {
      if (!appId) appId = await DynamicChoicesService.chooseApp();
      if (!name) name = await DynamicChoicesService.chooseSchedulerJob(appId);

      logger.debug(`Deleting scheduler job ${name} for appId: ${appId}`, this.DEBUG_TAG);
      this.preparePrintCommand(this, {
        appId,
        name,
      });

      await SchedulerService.deleteJob(appId, name);
      logger.info(`Successfully deleted job: ${name}`);
    } catch (error: any) {
      console.log(error);
      logger.debug(error, this.DEBUG_TAG);
      process.exit(1);
    }
  }
}
