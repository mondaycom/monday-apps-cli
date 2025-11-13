import { AuthenticatedCommand } from 'src/commands-base/authenticated-command';
import { SchedulerBaseFlags } from 'src/consts/scheduler/flags';
import { DynamicChoicesService } from 'src/services/dynamic-choices-service';
import { SchedulerService } from 'src/services/scheduler-service';
import logger from 'src/utils/logger';
import { chooseRegionIfNeeded, getRegionFromString } from 'src/utils/region';

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

    if (!appId) appId = await DynamicChoicesService.chooseApp();
    const selectedRegion = await chooseRegionIfNeeded(parsedRegion, { appId });
    if (!name) name = await DynamicChoicesService.chooseSchedulerJob(appId, selectedRegion);

    logger.debug(`Running scheduler job ${name} for appId: ${appId}`, this.DEBUG_TAG);
    this.preparePrintCommand(this, {
      appId,
      name,
      region: selectedRegion,
    });

    await SchedulerService.runJob(appId, name, selectedRegion);
    logger.info(`Successfully triggered job: ${name}`);
  }
}
