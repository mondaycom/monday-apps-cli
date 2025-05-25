import { AuthenticatedCommand } from 'src/commands-base/authenticated-command';
import { SchedulerBaseFlags } from 'src/consts/scheduler/flags';
import { DynamicChoicesService } from 'src/services/dynamic-choices-service';
import { SchedulerService } from 'src/services/scheduler-service';
import { printJobs } from 'src/services/scheduler-service.utils';
import logger from 'src/utils/logger';
import { chooseRegionIfNeeded, getRegionFromString } from 'src/utils/region';

export default class SchedulerList extends AuthenticatedCommand {
  static description = 'List all scheduler jobs for an app';
  static examples = ['<%= config.bin %> <%= command.id %> -a APP_ID'];

  static flags = SchedulerList.serializeFlags({
    appId: SchedulerBaseFlags.appId,
  });

  DEBUG_TAG = 'scheduler_list';

  public async run(): Promise<void> {
    const { flags } = await this.parse(SchedulerList);
    let { appId } = flags;
    const { region } = flags;
    const parsedRegion = getRegionFromString(region);
    try {
      appId = appId ? Number(appId) : await DynamicChoicesService.chooseApp();
      const selectedRegion = await chooseRegionIfNeeded(parsedRegion, { appId });

      logger.debug(`Listing scheduler jobs for appId: ${appId}`, this.DEBUG_TAG);
      this.preparePrintCommand(this, { appId, region: selectedRegion });

      const jobs = await SchedulerService.listJobs(appId, selectedRegion);
      printJobs(jobs);
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);
      process.exit(1);
    }
  }
}
