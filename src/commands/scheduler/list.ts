import { printJobs } from 'src/services/scheduler-service.utils';
import { chooseRegionIfNeeded, getRegionFromString } from 'utils/region';

import { SchedulerBaseFlags } from './consts/flags';
import { AuthenticatedCommand } from '../../commands-base/authenticated-command';
import { DynamicChoicesService } from '../../services/dynamic-choices-service';
import { SchedulerService } from '../../services/scheduler-service';
import logger from '../../utils/logger';

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
