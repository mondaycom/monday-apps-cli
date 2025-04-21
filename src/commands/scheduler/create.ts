import { Flags } from '@oclif/core';

import { PromptService } from 'src/services/prompt-service';
import { isDefined } from 'src/utils/validations';

import { AuthenticatedCommand } from '../../commands-base/authenticated-command';
import { APP_ID_TO_ENTER } from '../../consts/messages';
import { DynamicChoicesService } from '../../services/dynamic-choices-service';
import { SchedulerService } from '../../services/scheduler-service';
import { printJobs, validateCronExpression, validateTargetUrl } from '../../services/scheduler-service.utils';
import logger from '../../utils/logger';

const MESSAGES = {
  appId: APP_ID_TO_ENTER,
  name: 'Scheduled job name',
  description: 'Scheduled job description (optional)',
  schedule: 'Cron expression for the job schedule (relative to UTC)',
  targetUrl: 'Target URL path for the job (must start with /, will be relative to /mndy-cronjob)',
  maxRetries: 'Maximum number of retries for failed jobs (optional)',
  minBackoffDuration: 'Minimum backoff duration in seconds between retries (optional)',
  timeout: 'Job execution timeout in seconds (optional)',
};

export default class SchedulerCreate extends AuthenticatedCommand {
  static description = 'Create a new scheduler job for an app';
  static examples = [
    '<%= config.bin %> <%= command.id %> -a APP_ID -s "0 * * * *" -t "/my-endpoint"',
    '<%= config.bin %> <%= command.id %> -a APP_ID -s "0 * * * *" -t "/my-endpoint" -n "My special job" -d "My description"',
    '<%= config.bin %> <%= command.id %> -a APP_ID -s "0 * * * *" -t "/my-endpoint" -r 3 -b 10 -o 60',
  ];

  static flags = SchedulerCreate.serializeFlags({
    appId: Flags.integer({
      char: 'a',
      description: MESSAGES.appId,
    }),
    name: Flags.string({
      char: 'n',
      description: MESSAGES.name,
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

  DEBUG_TAG = 'scheduler_create';

  public async run(): Promise<void> {
    const { flags } = await this.parse(SchedulerCreate);
    let { appId, name, description, schedule, targetUrl, maxRetries, minBackoffDuration, timeout } = flags;

    try {
      if (!appId) appId = await DynamicChoicesService.chooseApp();
      if (!name) name = await PromptService.promptInput(MESSAGES.name, true);
      if (!schedule) schedule = await PromptService.promptInput(MESSAGES.schedule, true);
      validateCronExpression(schedule);
      if (!targetUrl) targetUrl = await PromptService.promptInput(MESSAGES.targetUrl, true);
      validateTargetUrl(targetUrl);
      if (!description) description = await PromptService.promptInput(MESSAGES.description, false, true);
      if (!maxRetries) maxRetries = await PromptService.promptInputNumber(MESSAGES.maxRetries, false, true);
      if (!minBackoffDuration)
        minBackoffDuration = await PromptService.promptInputNumber(MESSAGES.minBackoffDuration, false, true);
      if (!timeout) timeout = await PromptService.promptInputNumber(MESSAGES.timeout, false, true);

      logger.debug(`Creating scheduler job for appId: ${appId}`, this.DEBUG_TAG);
      this.preparePrintCommand(this, {
        appId,
        name,
        description,
        schedule,
        targetUrl,
        maxRetries,
        minBackoffDuration,
        timeout,
      });

      const job = await SchedulerService.createJob(appId, {
        name,
        description,
        schedule,
        targetUrl,
        ...(description ? { description } : {}),
        ...(isDefined(maxRetries) || isDefined(minBackoffDuration)
          ? { retryConfig: { maxRetries, minBackoffDuration } }
          : {}),
        ...(isDefined(timeout) ? { timeout } : {}),
      });

      printJobs([job]);
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);
      process.exit(1);
    }
  }
}
