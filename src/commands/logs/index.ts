import { Flags } from '@oclif/core';
import { PromptService } from '../../services/prompt-service.js';
import { logsStream } from '../../services/stats-service.js';
import { BaseCommand } from '../base-command.js';
import { APP_FEATURE_ID_TO_ENTER } from '../code/push.js';
import { LogsCommandArguments } from '../../types/commands/logs.js';
import { ConfigService } from '../../services/config-service.js';
import Logger from '../../utils/logger.js';
import { ACCESS_TOKEN_NOT_FOUND } from '../../consts/messages.js';
import { streamMessages } from '../../services/client-channel-service.js';

export const LOGS_TYPE_TO_LISTEN = 'Logs type: "http" for http events, "console" for stdout';

const appFeaturePrompt = async () => PromptService.promptInputNumber(APP_FEATURE_ID_TO_ENTER, true);

const logsTypePrompt = async () => PromptService.promptList(LOGS_TYPE_TO_LISTEN, ['http', 'console'], 'console');
export default class Logs extends BaseCommand {
  static description = 'Stream logs';

  static examples = ['<%= config.bin %> <%= command.id %> -i APP FEATURE ID TO STREAM LOGS -t LOGS TYPE TO WATCH'];

  static flags = {
    ...BaseCommand.globalFlags,
    appFeatureId: Flags.integer({
      char: 'i',
      description: APP_FEATURE_ID_TO_ENTER,
    }),
    logsType: Flags.string({
      char: 't',
      description: LOGS_TYPE_TO_LISTEN,
    }),
  };

  static args = [];
  public async run(): Promise<void> {
    const accessToken = ConfigService.getConfigDataByKey('accessToken');
    if (!accessToken) {
      Logger.error(ACCESS_TOKEN_NOT_FOUND);
      return;
    }

    const { flags } = await this.parse(Logs);

    const args: LogsCommandArguments = {
      appFeatureId: flags.appFeatureId || Number(await appFeaturePrompt()),
      logsType: flags.logsType || (await logsTypePrompt()),
    };

    const clientChannel = await logsStream(args.appFeatureId, args.logsType.toLowerCase());
    await streamMessages(clientChannel);
    process.exit(0);
  }
}
