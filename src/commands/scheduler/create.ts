import { AuthenticatedCommand } from 'src/commands-base/authenticated-command';
import { SchedulerFlags } from 'src/consts/scheduler/flags';
import { SchedulerMessages } from 'src/consts/scheduler/messages';
import { DynamicChoicesService } from 'src/services/dynamic-choices-service';
import { PromptService } from 'src/services/prompt-service';
import { SchedulerService } from 'src/services/scheduler-service';
import { printJobs, validateCronExpression, validateTargetUrl } from 'src/services/scheduler-service.utils';
import logger from 'src/utils/logger';
import { chooseRegionIfNeeded, getRegionFromString } from 'src/utils/region';
import { isDefined } from 'src/utils/validations';

export default class SchedulerCreate extends AuthenticatedCommand {
  static description = 'Create a new scheduler job for an app';
  static examples = [
    '<%= config.bin %> <%= command.id %> -a APP_ID -s "0 * * * *" -u="/my-endpoint"',
    '<%= config.bin %> <%= command.id %> -a APP_ID -s "0 * * * *" -u="/my-endpoint" -n "My-special-job" -d "My description"',
    '<%= config.bin %> <%= command.id %> -a APP_ID -s "0 * * * *" -u="/my-endpoint" -r 3 -b 10 -t 60',
  ];

  static flags = SchedulerCreate.serializeFlags(SchedulerFlags);

  DEBUG_TAG = 'scheduler_create';

  public async run(): Promise<void> {
    const { flags } = await this.parse(SchedulerCreate);
    let { appId, name, description, schedule, targetUrl, maxRetries, minBackoffDuration, timeout } = flags;
    const { region } = flags;
    const parsedRegion = getRegionFromString(region);
    try {
      if (!appId) appId = await DynamicChoicesService.chooseApp();
      const selectedRegion = await chooseRegionIfNeeded(parsedRegion, { appId });
      if (!name) name = await PromptService.promptInput(SchedulerMessages.name, true);
      if (!schedule) schedule = await PromptService.promptInput(SchedulerMessages.schedule, true);
      validateCronExpression(schedule);
      if (!targetUrl) targetUrl = await PromptService.promptInput(SchedulerMessages.targetUrl, true);
      validateTargetUrl(targetUrl);
      if (!description) description = await PromptService.promptInput(SchedulerMessages.description, false, true);
      if (!maxRetries) maxRetries = await PromptService.promptInputNumber(SchedulerMessages.maxRetries, false, true);
      if (!minBackoffDuration)
        minBackoffDuration = await PromptService.promptInputNumber(SchedulerMessages.minBackoffDuration, false, true);
      if (!timeout) timeout = await PromptService.promptInputNumber(SchedulerMessages.timeout, false, true);

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
        region: selectedRegion,
      });

      const job = await SchedulerService.createJob(
        appId,
        {
          name,
          description,
          schedule,
          targetUrl,
          ...(description ? { description } : {}),
          ...(isDefined(maxRetries) || isDefined(minBackoffDuration)
            ? { retryConfig: { maxRetries, minBackoffDuration } }
            : {}),
          ...(isDefined(timeout) ? { timeout } : {}),
        },
        selectedRegion,
      );

      printJobs([job]);
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);
      process.exit(1);
    }
  }
}
