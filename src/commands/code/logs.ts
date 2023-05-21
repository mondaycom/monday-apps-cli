import { Flags } from '@oclif/core';

import { BaseCommand } from 'commands/base-command.js';
import { ACCESS_TOKEN_NOT_FOUND, APP_VERSION_ID_TO_ENTER } from 'consts/messages';
import { streamMessages } from 'services/client-channel-service';
import { ConfigService } from 'services/config-service';
import { logsStream } from 'services/notification-service';
import { PromptService } from 'services/prompt-service';
import { LogType, LogsCommandArguments } from 'types/commands/logs';
import logger from 'utils/logger';

export const LOGS_TYPE_TO_LISTEN_PROMPT_MESSAGE = 'Logs type: "http" for http events, "console" for stdout';

const appVersionPrompt = async () => PromptService.promptInputNumber(APP_VERSION_ID_TO_ENTER, true);

const logsTypePrompt = async () =>
  PromptService.promptList(LOGS_TYPE_TO_LISTEN_PROMPT_MESSAGE, [LogType.CONSOLE, LogType.HTTP], LogType.CONSOLE);

export default class Logs extends BaseCommand {
  static description = 'Stream logs';

  /// / Preparation when we expose HTTP events
  static examples = ['<%= config.bin %> <%= command.id %> -i APP VERSION ID TO STREAM LOGS -t LOGS TYPE TO WATCH'];

  static flags = {
    ...BaseCommand.globalFlags,
    appVersionId: Flags.integer({
      char: 'i',
      description: APP_VERSION_ID_TO_ENTER,
    }),
    logsType: Flags.string({
      char: 't',
      description: LOGS_TYPE_TO_LISTEN_PROMPT_MESSAGE,
    }),
  };

  static args = [];
  public async run(): Promise<void> {
    const accessToken = ConfigService.getConfigDataByKey('accessToken');
    if (!accessToken) {
      logger.error(ACCESS_TOKEN_NOT_FOUND);
      return;
    }

    const { flags } = await this.parse(Logs);

    const args: LogsCommandArguments = {
      appVersionId: flags.appVersionId || Number(await appVersionPrompt()),
      logsType: (flags.logsType || (await logsTypePrompt())) as LogType,
    };

    const clientChannel = await logsStream(args.appVersionId, args.logsType);
    await streamMessages(clientChannel);
    this.exit(0);
  }
}
