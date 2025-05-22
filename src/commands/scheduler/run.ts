import { chooseRegionIfNeeded, getRegionFromString } from 'utils/region';

import { SchedulerBaseFlags } from './consts/flags';
import { AuthenticatedCommand } from '../../commands-base/authenticated-command';
import { DynamicChoicesService } from '../../services/dynamic-choices-service';
import { SchedulerService } from '../../services/scheduler-service';
import logger from '../../utils/logger';

export default class SchedulerRun extends AuthenticatedCommand {
  static description = 'Manually trigger a scheduled job to run for an app';
  static examples = ['<%= config.bin %> <%= command.id %> -a APP_ID -n "my-job"'];

  static flags = SchedulerRun.serializeFlags(SchedulerBaseFlags);

  DEBUG_TAG = 'scheduler_run';

  public async run(): Promise<void> {
    const { flags } = await this.parse(SchedulerRun);
    let { appId, name } = flags;
    const { region } = flags;
    const parsedRegion = getRegionFromString(region);

    try {
      if (!appId) appId = await DynamicChoicesService.chooseApp();
      const selectedRegion = await chooseRegionIfNeeded(parsedRegion, { appId });
      if (!name) name = await DynamicChoicesService.chooseSchedulerJob(appId);

      logger.debug(`Running scheduler job ${name} for appId: ${appId}`, this.DEBUG_TAG);
      this.preparePrintCommand(this, {
        appId,
        name,
        region: selectedRegion,
      });

      await SchedulerService.runJob(appId, name, selectedRegion);
      logger.info(`Successfully triggered job: ${name}`);
    } catch (error: any) {
      console.log(error);
      logger.debug(error, this.DEBUG_TAG);
      process.exit(1);
    }
  }
}
