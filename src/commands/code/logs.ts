import { Flags } from '@oclif/core';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_VERSION_ID_TO_ENTER } from 'consts/messages';
import { streamMessages } from 'services/client-channel-service';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { logsStream } from 'services/notification-service';
import { PromptService } from 'services/prompt-service';
import { LogType, LogsCommandArguments } from 'types/commands/logs';

export const LOGS_TYPE_TO_LISTEN_PROMPT_MESSAGE = 'Logs type: "http" for http events, "console" for stdout';

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
  });

  static args = {};
  public async run(): Promise<void> {
    const { flags } = await this.parse(Logs);

    let appVersionId = flags.appVersionId;
    if (!appVersionId) {
      const appAndAppVersion = await DynamicChoicesService.chooseAppAndAppVersion();
      appVersionId = appAndAppVersion.appVersionId;
    }

    const args: LogsCommandArguments = {
      appVersionId,
      logsType: (flags.logsType || (await logsTypePrompt())) as LogType,
    };

    const clientChannel = await logsStream(args.appVersionId, args.logsType);
    await streamMessages(clientChannel);
    this.exit(0);
  }
}
