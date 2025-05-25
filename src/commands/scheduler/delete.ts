import { AuthenticatedCommand } from 'src/commands-base/authenticated-command';
import { SchedulerBaseFlags } from 'src/consts/scheduler/flags';
import { DynamicChoicesService } from 'src/services/dynamic-choices-service';
import { SchedulerService } from 'src/services/scheduler-service';
import logger from 'src/utils/logger';
import { chooseRegionIfNeeded, getRegionFromString } from 'src/utils/region';

export default class SchedulerDelete extends AuthenticatedCommand {
  static description = 'Delete a scheduler job for an app';
  static examples = ['<%= config.bin %> <%= command.id %> -a APP_ID -n "my-job"'];

  static flags = SchedulerDelete.serializeFlags(SchedulerBaseFlags);

  DEBUG_TAG = 'scheduler_delete';

  public async run(): Promise<void> {
    const { flags } = await this.parse(SchedulerDelete);
    let { appId, name } = flags;
    const { region } = flags;
    const parsedRegion = getRegionFromString(region);

    try {
      if (!appId) appId = await DynamicChoicesService.chooseApp();
      const selectedRegion = await chooseRegionIfNeeded(parsedRegion, { appId });
      if (!name) name = await DynamicChoicesService.chooseSchedulerJob(appId);

      logger.debug(`Deleting scheduler job ${name} for appId: ${appId}`, this.DEBUG_TAG);
      this.preparePrintCommand(this, {
        appId,
        name,
        region: selectedRegion,
      });

      await SchedulerService.deleteJob(appId, name, selectedRegion);
      logger.info(`Successfully deleted job: ${name}`);
    } catch (error: any) {
      console.log(error);
      logger.debug(error, this.DEBUG_TAG);
      process.exit(1);
    }
  }
}
