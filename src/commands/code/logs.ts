import { Flags } from '@oclif/core';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_VERSION_ID_TO_ENTER } from 'consts/messages';
import { streamMessages } from 'services/client-channel-service';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { logsStream } from 'services/notification-service';
import { PromptService } from 'services/prompt-service';
import { EventSource } from 'types/commands/global';
import { LogType, LogsCommandArguments, LogsFilterCriteriaArguments } from 'types/commands/logs';

const SUPPORTED_HISTORY_FLAGS = ' [supported only if eventSource=live]';
const DAY_IN_MS = 86_400_000;
const LOGS_START_DATE = 'Start date (MM/DD/YYYY HH:mm) e.g. "03/24/1983 15:45"' + SUPPORTED_HISTORY_FLAGS;
const LOGS_END_DATE = 'End date (MM/DD/YYYY HH:mm) e.g. "03/25/1983 16:45"' + SUPPORTED_HISTORY_FLAGS;
const LOGS_TYPE_TO_LISTEN_PROMPT_MESSAGE = 'Logs type: "http" for http events, "console" for stdout';
const EVENT_SOURCE = 'Source: "live" for live events, "History" for fetching events from the past';
const EVENT_SEARCH_FOR_TEXT =
  'text: a text in regex that will be searched among the logs text' + SUPPORTED_HISTORY_FLAGS;
const LOGS_PROMPT_SEARCH_FOR_TEXT = 'Search for text (please put searching value in side a quotes)';
const LOGS_PROMPT_START_DATE = 'Start date';
const LOGS_MAX_RANGE_BETWEEN_DATES = 3;
const LOGS_PROMPT_END_DATE = `End date can be up to ${LOGS_MAX_RANGE_BETWEEN_DATES} days since`;
const eventSourcePrompt = async () =>
  PromptService.promptList(EVENT_SOURCE, [EventSource.LIVE, EventSource.HISTORY], EventSource.LIVE);
const logsTypePrompt = async () =>
  PromptService.promptList(LOGS_TYPE_TO_LISTEN_PROMPT_MESSAGE, [LogType.CONSOLE, LogType.HTTP], LogType.CONSOLE);

export default class Logs extends AuthenticatedCommand {
  static description = 'Stream logs';

  /// / Preparation when we expose HTTP events
  static examples = ['<%= config.bin %> <%= command.id %> -i APP_VERSION_ID -t LOGS_TYPE'];

  static flags = Logs.serializeFlags({
    appVersionId: Flags.integer({
      char: 'i',
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
      description: LOGS_START_DATE,
      relationships: [
        {
          type: 'none',
          flags: [
            {
              name: 'eventSource',
              when: flags => {
                return new Promise(res => {
                  res(flags.eventSource !== EventSource.HISTORY);
                });
              },
            },
          ],
        },
      ],
    }),
    logsEndDate: Flags.string({
      char: 'e',
      description: LOGS_END_DATE,
      relationships: [
        {
          type: 'none',
          flags: [
            {
              name: 'eventSource',
              when: flags => {
                return new Promise(res => {
                  res(flags.eventSource !== EventSource.HISTORY);
                });
              },
            },
          ],
        },
      ],
    }),
    logSearchFromText: Flags.string({
      char: 'r',
      description: EVENT_SEARCH_FOR_TEXT,
      relationships: [
        {
          type: 'none',
          flags: [
            {
              name: 'eventSource',
              when: flags => {
                return new Promise(res => {
                  res(flags.eventSource !== EventSource.HISTORY);
                });
              },
            },
          ],
        },
      ],
    }),
  });

  static args = {};
  private async getAppVersionId(appVersionId: number | null | undefined): Promise<number> {
    if (!appVersionId) {
      const { appVersionId: inputAppVersionId } = await DynamicChoicesService.chooseAppAndAppVersion();
      return inputAppVersionId;
    }

    return appVersionId;
  }

  private async getLogType(
    eventSource: string | null | undefined,
    logsType: string | null | undefined,
  ): Promise<LogType> {
    const eventSourceType = (eventSource || (await eventSourcePrompt())) as EventSource;
    const logsTypeCandidate = (logsType || (await logsTypePrompt())) as LogType;
    let calcLogsType = logsTypeCandidate;
    if (eventSourceType === EventSource.HISTORY) {
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

  private isDate(value: string | null | undefined): boolean {
    if (!value) {
      return false;
    }

    return new Date(value).toString() !== 'Invalid Date';
  }

  private getDayDiff(fromDate: Date, toDate: Date): number | null {
    if (!fromDate.getTime || !toDate.getTime) {
      return null;
    }

    const diffInMS = toDate.getTime() - fromDate.getTime();
    return diffInMS / DAY_IN_MS;
  }

  private async getLogsToDate(
    logsEndDate: string | null | undefined,
    fromDate: Date,
    fromDatePlus1Day: Date,
    options: unknown,
  ): Promise<Date> {
    const toDate: Date = this.isDate(logsEndDate)
      ? new Date(logsEndDate!)
      : await PromptService.promptDateTimePicker(LOGS_PROMPT_END_DATE, fromDatePlus1Day, options);

    const dayDiff = this.getDayDiff(fromDate, toDate);
    if (!dayDiff) {
      console.error('Something went wrong if logs date calculations.');
      this.exit(1);
    }

    if (dayDiff! < 0) {
      console.error('Logs end date is earlier the start day.');
      return PromptService.promptDateTimePicker(LOGS_PROMPT_END_DATE, fromDatePlus1Day, options);
    }

    if (dayDiff! > LOGS_MAX_RANGE_BETWEEN_DATES) {
      console.error(`Logs dates range is greater then ${LOGS_MAX_RANGE_BETWEEN_DATES} days.`);
      return PromptService.promptDateTimePicker(LOGS_PROMPT_END_DATE, fromDatePlus1Day, options);
    }

    return toDate;
  }

  private async getLogsFilterCriteria(
    logsType: LogType,
    logsStartDate: string | null | undefined,
    logsEndDate: string | null | undefined,
    logSearchFromText: string | null | undefined,
  ): Promise<LogsFilterCriteriaArguments | null> {
    const isLogTypeHistory = logsType === LogType.HTTP_HISTORY || logsType === LogType.CONSOLE_HISTORY;
    if (!isLogTypeHistory) {
      return null;
    }

    const fromDate: Date = this.isDate(logsStartDate)
      ? new Date(logsStartDate!)
      : await PromptService.promptDateTimePicker(LOGS_PROMPT_START_DATE);

    const fromDateInMS = fromDate.getTime();
    const fromDatePlus1Day = new Date(fromDateInMS + DAY_IN_MS);
    const maxDateInMS = DAY_IN_MS * LOGS_MAX_RANGE_BETWEEN_DATES;
    const minuteInMS = 60_000;
    const maxDate = new Date(fromDateInMS + maxDateInMS + minuteInMS);

    const options = {
      validate: (selectedDate: Date) => {
        const selectedDateSmallerThenMaxDate = selectedDate < maxDate;
        const selectedDateHigherThenFromDate = selectedDate > fromDate;
        if (!selectedDateSmallerThenMaxDate) {
          console.log(`\n Max date to select: "${maxDate.toString()}"`);
          return false;
        }

        if (!selectedDateHigherThenFromDate) {
          console.log(`\n Min date date to select: "${fromDate.toString()}"`);
          return false;
        }

        return true;
      },
    };

    const toDate = await this.getLogsToDate(logsEndDate, fromDate, fromDatePlus1Day, options);
    const text =
      isLogTypeHistory && logSearchFromText !== ''
        ? await PromptService.promptInput(LOGS_PROMPT_SEARCH_FOR_TEXT)
        : logSearchFromText;

    return { fromDate, toDate, text };
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Logs);

    const appVersionId = await this.getAppVersionId(flags.appVersionId);

    const logsType = await this.getLogType(flags.eventSource, flags.logsType);

    const logsFilterCriteria = await this.getLogsFilterCriteria(
      logsType,
      flags.logsStartDate,
      flags.logsEndDate,
      flags.logSearchFromText,
    );

    const args: LogsCommandArguments = {
      appVersionId,
      logsType,
      logsFilterCriteria,
    };
    const clientChannel = await logsStream(args.appVersionId, args.logsType, logsFilterCriteria);
    await streamMessages(clientChannel);
    this.exit(0);
  }
}
