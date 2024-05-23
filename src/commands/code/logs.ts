import { Flags } from '@oclif/core';
import { Relationship } from '@oclif/core/lib/interfaces/parser';

import { addRegionToFlags } from 'commands/utils/region';
import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_VERSION_ID_TO_ENTER } from 'consts/messages';
import { streamMessages } from 'services/client-channel-service';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { logsStream } from 'services/notification-service';
import { PromptService } from 'services/prompt-service';
import { EventSource, LogType, LogsCommandArguments, LogsFilterCriteriaArguments } from 'types/commands/logs';
import { Region } from 'types/general/region';
import { isDefined } from 'utils/guards';
import logger from 'utils/logger';
import { getRegionFromString } from 'utils/region';
import { TIME_IN_MILLISECONDS } from 'utils/time-enum';
import { getDayDiff, isDate } from 'utils/validations';

const SUPPORTED_HISTORY_FLAGS = ' [supported only if eventSource=live]';
const DAY_IN_MS = Number(TIME_IN_MILLISECONDS.DAY);
const LOGS_TYPE_TO_LISTEN_PROMPT_MESSAGE = 'Logs type: "http" for http events, "console" for stdout';
const EVENT_SOURCE = 'Source: "live" for live events, "History" for fetching events from the past';
const EVENT_SEARCH_FOR_TEXT =
  'text: a text in regex that will be searched among the logs text' + SUPPORTED_HISTORY_FLAGS;
const LOGS_MAX_RANGE_BETWEEN_DATES = 3;
const LOGS_PROMPT_END_DATE = `End date can be up to ${LOGS_MAX_RANGE_BETWEEN_DATES} days since`;

const eventSourcePrompt = async () =>
  PromptService.promptList(EVENT_SOURCE, [EventSource.LIVE, EventSource.HISTORY], EventSource.LIVE);
const logsTypePrompt = async () =>
  PromptService.promptList(LOGS_TYPE_TO_LISTEN_PROMPT_MESSAGE, [LogType.CONSOLE, LogType.HTTP], LogType.CONSOLE);
const relationships: Relationship[] = [
  {
    type: 'none',
    flags: [
      {
        name: 'eventSource',
        when: (flags: Record<string, unknown>) => {
          return new Promise(res => {
            res(flags.eventSource !== EventSource.HISTORY);
          });
        },
      },
    ],
  },
];
export default class Logs extends AuthenticatedCommand {
  static description = 'Stream logs';

  static examples = ['<%= config.bin %> <%= command.id %> -i APP_VERSION_ID -t LOGS_TYPE'];

  static flags = Logs.serializeFlags(
    addRegionToFlags({
      appVersionId: Flags.integer({
        char: 'i',
        aliases: ['v'],
        description: APP_VERSION_ID_TO_ENTER,
      }),
      logsType: Flags.string({
        char: 't',
        description: LOGS_TYPE_TO_LISTEN_PROMPT_MESSAGE,
      }),
      eventSource: Flags.string({
        char: 's',
        description: EVENT_SOURCE,
      }),
      logsStartDate: Flags.string({
        char: 'f',
        description: 'Start date (MM/DD/YYYY HH:mm) e.g. "03/24/1983 15:45"' + SUPPORTED_HISTORY_FLAGS,
        relationships,
      }),
      logsEndDate: Flags.string({
        char: 'e',
        description: 'End date (MM/DD/YYYY HH:mm) e.g. "03/25/1983 16:45"' + SUPPORTED_HISTORY_FLAGS,
        relationships,
      }),
      logSearchFromText: Flags.string({
        char: 'r',
        description: EVENT_SEARCH_FOR_TEXT,
        relationships,
      }),
    }),
  );

  static args = {};
  DEBUG_TAG = 'logs';

  public async run(): Promise<void> {
    try {
      const { flags } = await this.parse(Logs);
      const { logsStartDate, logsEndDate, logSearchFromText, region: strRegion } = flags;
      const region = getRegionFromString(strRegion);
      const appVersionId = await this.getAppVersionId(flags.appVersionId);

      const eventSource = (flags.eventSource || (await eventSourcePrompt())) as EventSource;
      const logsType = await this.getLogType(eventSource, flags.logsType);
      const logsFilterCriteria = await this.getLogsFilterCriteria(
        eventSource,
        logsStartDate,
        logsEndDate,
        logSearchFromText,
      );

      const args: LogsCommandArguments = {
        appVersionId,
        logsType,
        logsFilterCriteria,
      };

      this.preparePrintCommand(this, {
        appVersionId,
        logsType,
        eventSource,
        logsStartDate: logsFilterCriteria?.fromDate && `"${logsFilterCriteria.fromDate.toString()}"`,
        logsEndDate: logsFilterCriteria?.toDate && `"${logsFilterCriteria.toDate.toString()}"`,
        logSearchFromText: logsFilterCriteria?.text,
      });

      const clientChannel = await logsStream(args.appVersionId, args.logsType, logsFilterCriteria, region);
      await streamMessages(clientChannel);
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);

      // need to signal to the parent process that the command failed
      process.exit(1);
    }
  }

  private async getAppVersionId(appVersionId?: number): Promise<number> {
    if (!appVersionId) {
      const { appVersionId: inputAppVersionId } = await DynamicChoicesService.chooseAppAndAppVersion(true, true);
      return inputAppVersionId;
    }

    return appVersionId;
  }

  private async getLogType(eventSource: EventSource, logsType?: string): Promise<LogType> {
    const logsTypeCandidate = (logsType || (await logsTypePrompt())) as LogType;
    let calcLogsType = logsTypeCandidate;
    if (eventSource === EventSource.HISTORY) {
      switch (logsTypeCandidate) {
        case LogType.CONSOLE: {
          calcLogsType = LogType.CONSOLE_HISTORY;
          break;
        }

        case LogType.HTTP: {
          calcLogsType = LogType.HTTP_HISTORY;
          break;
        }
      }
    }

    return calcLogsType;
  }

  private async getLogsToDate(
    fromDate: Date,
    fromDatePlus1Day: Date,
    options: unknown,
    logsEndDate?: string,
  ): Promise<Date> {
    const toDate: Date = isDate(logsEndDate)
      ? new Date(logsEndDate!)
      : await PromptService.promptDateTimePicker(LOGS_PROMPT_END_DATE, fromDatePlus1Day, options);

    const dayDiff = getDayDiff(fromDate, toDate);
    if (!isDefined(dayDiff)) {
      console.error('Something went wrong in logs date calculations.');
      process.exit(1);
    }

    if (dayDiff < 0) {
      logger.error('Logs end date is earlier the start date.');
      return PromptService.promptDateTimePicker(LOGS_PROMPT_END_DATE, fromDatePlus1Day, options);
    }

    if (dayDiff > LOGS_MAX_RANGE_BETWEEN_DATES) {
      logger.error(`Logs dates range is greater then ${LOGS_MAX_RANGE_BETWEEN_DATES} days.`);
      return PromptService.promptDateTimePicker(LOGS_PROMPT_END_DATE, fromDatePlus1Day, options);
    }

    return toDate;
  }

  private async readDateInput(title: string, inputDate?: string): Promise<Date> {
    const yesterday = new Date(Date.now() - DAY_IN_MS);
    return isDate(inputDate) ? new Date(inputDate!) : PromptService.promptDateTimePicker(title, yesterday);
  }

  private async readTextLogSearchInput(
    title: string,
    isLogTypeHistory: boolean,
    inputText?: string | undefined,
  ): Promise<string | undefined> {
    return isLogTypeHistory && inputText === undefined ? PromptService.promptInput(title) : inputText;
  }

  private buildDatePickerConfiguration = (fromDate: Date, maxDate: Date) => {
    const options = {
      validate: (selectedDate: Date) => {
        const selectedDateSmallerThenMaxDate = selectedDate < maxDate;
        const selectedDateHigherThenFromDate = selectedDate > fromDate;
        if (!selectedDateSmallerThenMaxDate) {
          logger.log(`\n Max date to select: "${maxDate.toString()}"`);
          return false;
        }

        if (!selectedDateHigherThenFromDate) {
          logger.log(`\n Min date date to select: "${fromDate.toString()}"`);
          return false;
        }

        return true;
      },
    };
    return options;
  };

  private async getLogsFilterCriteria(
    logsType: EventSource,
    logsStartDate?: string,
    logsEndDate?: string,
    logSearchFromText?: string,
  ): Promise<LogsFilterCriteriaArguments | null> {
    const isLogTypeHistory = logsType === EventSource.HISTORY;
    if (!isLogTypeHistory) {
      return null;
    }

    const fromDate: Date = await this.readDateInput('Start date', logsStartDate);
    const fromDateInMS = fromDate.getTime();
    const fromDatePlus1Day = new Date(fromDateInMS + DAY_IN_MS);
    const maxDateInMS = DAY_IN_MS * LOGS_MAX_RANGE_BETWEEN_DATES;
    const minuteInMS = Number(TIME_IN_MILLISECONDS.MINUTE);
    const maxDate = new Date(fromDateInMS + maxDateInMS + minuteInMS);
    const datePickerOptions = this.buildDatePickerConfiguration(fromDate, maxDate);
    const toDate = await this.getLogsToDate(fromDate, fromDatePlus1Day, datePickerOptions, logsEndDate);

    const text = await this.readTextLogSearchInput(
      'Search for text (please put searching value in side a quotes)',
      isLogTypeHistory,
      logSearchFromText,
    );

    return { fromDate, toDate, text };
  }
}
