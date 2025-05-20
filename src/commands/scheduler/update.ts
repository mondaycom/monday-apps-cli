import { PromptService } from 'src/services/prompt-service';
import { UpdateJobRequest } from 'src/types/services/scheduler-service';
import { isDefined, isDefinedAndNotEmpty } from 'src/utils/validations';
import { chooseRegionIfNeeded, getRegionFromString } from 'utils/region';

import { SchedulerFlags } from './consts/flags';
import { SchedulerMessages } from './consts/messages';
import { AuthenticatedCommand } from '../../commands-base/authenticated-command';
import { DynamicChoicesService } from '../../services/dynamic-choices-service';
import { SchedulerService } from '../../services/scheduler-service';
import { printJobs, validateCronExpression, validateTargetUrl } from '../../services/scheduler-service.utils';
import logger from '../../utils/logger';

export default class SchedulerUpdate extends AuthenticatedCommand {
  static description = 'Update a scheduler job for an app';
  static examples = [
    '<%= config.bin %> <%= command.id %> -a APP_ID -n "my-job" -s "0 * * * *"',
    '<%= config.bin %> <%= command.id %> -a APP_ID -n "my-job" -u "/my-endpoint"',
    '<%= config.bin %> <%= command.id %> -a APP_ID -n "my-job" -d "My description" -r 3 -b 10 -t 60',
  ];

  static flags = SchedulerUpdate.serializeFlags(SchedulerFlags);

  DEBUG_TAG = 'scheduler_update';

  public async run(): Promise<void> {
    const { flags } = await this.parse(SchedulerUpdate);
    let { appId, name, description, schedule, targetUrl, maxRetries, minBackoffDuration, timeout } = flags;
    const { region } = flags;
    const parsedRegion = getRegionFromString(region);
    try {
      if (!appId) appId = await DynamicChoicesService.chooseApp();
      const selectedRegion = await chooseRegionIfNeeded(parsedRegion, { appId });
      if (!name) name = await DynamicChoicesService.chooseSchedulerJob(appId);

      // Get the current job details
      const jobs = await SchedulerService.listJobs(appId, selectedRegion);
      const currentJob = jobs.find(job => job.name === name);
      if (!currentJob) {
        throw new Error(`Job ${name} not found`);
      }

      logger.info(`All parameters are optional, press enter to skip`);
      // Only prompt for fields that weren't provided in flags
      if (!description) description = await PromptService.promptInput(SchedulerMessages.description, false, true);
      if (!schedule) schedule = await PromptService.promptInput(SchedulerMessages.schedule, false, true);
      if (schedule) validateCronExpression(schedule);
      if (!targetUrl) targetUrl = await PromptService.promptInput(SchedulerMessages.targetUrl, false, true);
      if (targetUrl) validateTargetUrl(targetUrl);
      if (!maxRetries) maxRetries = await PromptService.promptInputNumber(SchedulerMessages.maxRetries, false, true);
      if (!minBackoffDuration)
        minBackoffDuration = await PromptService.promptInputNumber(SchedulerMessages.minBackoffDuration, false, true);
      if (!timeout) timeout = await PromptService.promptInputNumber(SchedulerMessages.timeout, false, true);

      logger.debug(`Updating scheduler job ${name} for appId: ${appId}`, this.DEBUG_TAG);
      this.preparePrintCommand(this, {
        appId,
        name,
        description,
        schedule,
        targetUrl,
        maxRetries,
        minBackoffDuration,
        timeout,
        region: selectedRegion,
      });

      // Create update payload with only the fields that were provided
      const updatePayload: UpdateJobRequest = {};
      if (isDefinedAndNotEmpty(description)) updatePayload.description = description;
      if (isDefinedAndNotEmpty(schedule)) updatePayload.schedule = schedule;
      if (isDefinedAndNotEmpty(targetUrl)) updatePayload.targetUrl = targetUrl;
      if (isDefined(maxRetries) || isDefined(minBackoffDuration)) {
        updatePayload.retryConfig = { maxRetries, minBackoffDuration };
      }

      if (isDefined(timeout)) updatePayload.timeout = timeout;

      if (isDefinedAndNotEmpty(updatePayload)) {
        const job = await SchedulerService.updateJob(appId, name, updatePayload, selectedRegion);
        printJobs([job]);
        logger.info(`Successfully updated job: ${name}`);
      } else {
        logger.info(`No changes to update for job: ${name}`);
      }
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);
      process.exit(1);
    }
  }
}
