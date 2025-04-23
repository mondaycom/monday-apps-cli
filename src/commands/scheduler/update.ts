import { Flags } from '@oclif/core';

import { PromptService } from 'src/services/prompt-service';
import { isDefined, isDefinedAndNotEmpty } from 'src/utils/validations';

import { AuthenticatedCommand } from '../../commands-base/authenticated-command';
import { APP_ID_TO_ENTER } from '../../consts/messages';
import { DynamicChoicesService } from '../../services/dynamic-choices-service';
import { SchedulerService } from '../../services/scheduler-service';
import {
  UpdateJobRequest,
  printJobs,
  validateCronExpression,
  validateTargetUrl,
} from '../../services/scheduler-service.utils';
import logger from '../../utils/logger';

const MESSAGES = {
  appId: APP_ID_TO_ENTER,
  jobName: 'Name of the job to update',
  description: 'Scheduled job description (optional)',
  schedule: 'Cron expression for the job schedule (relative to UTC)',
  targetUrl: 'Target URL path for the job (must start with /, will be relative to /mndy-cronjob)',
  maxRetries: 'Maximum number of retries for failed jobs (optional)',
  minBackoffDuration: 'Minimum backoff duration in seconds between retries (optional)',
  timeout: 'Job execution timeout in seconds (optional)',
};

export default class SchedulerUpdate extends AuthenticatedCommand {
  static description = 'Update a scheduler job for an app';
  static examples = [
    '<%= config.bin %> <%= command.id %> -a APP_ID -n "my-job" -s "0 * * * *"',
    '<%= config.bin %> <%= command.id %> -a APP_ID -n "my-job" -t "/my-endpoint"',
    '<%= config.bin %> <%= command.id %> -a APP_ID -n "my-job" -d "My description" -r 3 -b 10 -o 60',
  ];

  static flags = SchedulerUpdate.serializeFlags({
    appId: Flags.integer({
      char: 'a',
      description: MESSAGES.appId,
    }),
    jobName: Flags.string({
      char: 'n',
      description: MESSAGES.jobName,
    }),
    description: Flags.string({
      char: 'd',
      description: MESSAGES.description,
    }),
    schedule: Flags.string({
      char: 's',
      description: MESSAGES.schedule,
    }),
    targetUrl: Flags.string({
      char: 't',
      description: MESSAGES.targetUrl,
    }),
    maxRetries: Flags.integer({
      char: 'r',
      description: MESSAGES.maxRetries,
    }),
    minBackoffDuration: Flags.integer({
      char: 'b',
      description: MESSAGES.minBackoffDuration,
    }),
    timeout: Flags.integer({
      char: 'o',
      description: MESSAGES.timeout,
    }),
  });

  DEBUG_TAG = 'scheduler_update';

  public async run(): Promise<void> {
    const { flags } = await this.parse(SchedulerUpdate);
    let { appId, jobName, description, schedule, targetUrl, maxRetries, minBackoffDuration, timeout } = flags;

    try {
      if (!appId) appId = await DynamicChoicesService.chooseApp();
      if (!jobName) jobName = await DynamicChoicesService.chooseSchedulerJob(appId);

      // Get the current job details
      const jobs = await SchedulerService.listJobs(appId);
      const currentJob = jobs.find(job => job.name === jobName);
      if (!currentJob) {
        throw new Error(`Job ${jobName} not found`);
      }

      // Only prompt for fields that weren't provided in flags
      if (!description) description = await PromptService.promptInput(MESSAGES.description, false, true);
      if (!schedule) schedule = await PromptService.promptInput(MESSAGES.schedule, false, true);
      if (schedule) validateCronExpression(schedule);
      if (!targetUrl) targetUrl = await PromptService.promptInput(MESSAGES.targetUrl, false, true);
      if (targetUrl) validateTargetUrl(targetUrl);
      if (!maxRetries) maxRetries = await PromptService.promptInputNumber(MESSAGES.maxRetries, false, true);
      if (!minBackoffDuration)
        minBackoffDuration = await PromptService.promptInputNumber(MESSAGES.minBackoffDuration, false, true);
      if (!timeout) timeout = await PromptService.promptInputNumber(MESSAGES.timeout, false, true);

      logger.debug(`Updating scheduler job ${jobName} for appId: ${appId}`, this.DEBUG_TAG);
      this.preparePrintCommand(this, {
        appId,
        jobName,
        description,
        schedule,
        targetUrl,
        maxRetries,
        minBackoffDuration,
        timeout,
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
        const job = await SchedulerService.updateJob(appId, jobName, updatePayload);
        printJobs([job]);
        logger.info(`Successfully updated job: ${jobName}`);
      } else {
        logger.info(`No changes to update for job: ${jobName}`);
      }
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);
      process.exit(1);
    }
  }
}
