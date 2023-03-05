import { Flags } from '@oclif/core';
import { PromptService } from '../../services/prompt-service.js';
import { logsStream } from '../../services/notification-service.js';
import { BaseCommand } from '../base-command.js';
import { APP_FEATURE_ID_TO_ENTER } from '../code/push.js';
import { LogsCommandArguments, LogType } from '../../types/commands/logs.js';
import { ConfigService } from '../../services/config-service.js';
import logger from '../../utils/logger.js';
import { ACCESS_TOKEN_NOT_FOUND } from '../../consts/messages.js';
import { streamMessages } from '../../services/client-channel-service.js';

export const LOGS_TYPE_TO_LISTEN_PROMPT_MESSAGE = 'Logs type: "http" for http events, "console" for stdout';

const appFeaturePrompt = async () => PromptService.promptInputNumber(APP_FEATURE_ID_TO_ENTER, true);

const logsTypePrompt = async () =>
  PromptService.promptList(LOGS_TYPE_TO_LISTEN_PROMPT_MESSAGE, [LogType.CONSOLE, LogType.HTTP], LogType.CONSOLE);

export default class Logs extends BaseCommand {
  static description = 'Stream logs';

  /// / Preparation when we expose HTTP events
  static examples = ['<%= config.bin %> <%= command.id %> -i APP FEATURE ID TO STREAM LOGS -t LOGS TYPE TO WATCH'];

  static flags = {
    ...BaseCommand.globalFlags,
    appFeatureId: Flags.integer({
      char: 'i',
      description: APP_FEATURE_ID_TO_ENTER,
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
      appFeatureId: flags.appFeatureId || Number(await appFeaturePrompt()),
      logsType: (flags.logsType || (await logsTypePrompt())) as LogType,
    };

    const clientChannel = await logsStream(args.appFeatureId, args.logsType);
    await streamMessages(clientChannel);
    this.exit(0);
  }
}
