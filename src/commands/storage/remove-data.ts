import { Flags } from '@oclif/core';
import chalk from 'chalk';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_ID_TO_ENTER } from 'consts/messages';
import { removeAppStorageDataForAccount } from 'services/apps-service';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { PromptService } from 'services/prompt-service';
import { HttpError } from 'types/errors';
import logger from 'utils/logger';

const MESSAGES = {
  clientAccountNumber: 'Client account id (number)',
  appId: APP_ID_TO_ENTER,
  areYouSurePrompt: 'Are you sure you want to remove this account data? -= this operation cannot be undone =- (yes/no)',
  force: 'Force push to live version',
  operationAborted: 'Operation aborted',
  removingData: 'Removing data...',
};

export default class RemoveData extends AuthenticatedCommand {
  static description = 'Completely remove all the storage data for specific customer account.';

  static examples = ['<%= config.bin %> <%= command.id %> -a APP_ID -c CLIENT_ACCOUNT_ID'];

  static flags = RemoveData.serializeFlags({
    appId: Flags.integer({
      char: 'a',
      description: 'Select the app that you wish to retrieve the key for',
    }),
    clientAccountId: Flags.integer({
      char: 'c',
      description: MESSAGES.clientAccountNumber,
    }),
    force: Flags.boolean({
      char: 'f',
      description: MESSAGES.force,
    }),
  });

  public async run(): Promise<void> {
    const { flags } = await this.parse(RemoveData);
    let { appId, clientAccountId } = flags;
    const { force } = flags;
    try {
      if (!appId) {
        appId = await DynamicChoicesService.chooseApp();
      }

      if (!clientAccountId) {
        clientAccountId = await PromptService.promptInputNumber(`${MESSAGES.clientAccountNumber}:`, true);
      }

      if (!force) {
        const answer = await PromptService.promptInput(MESSAGES.areYouSurePrompt, true);
        if (`${answer}`.toLowerCase().includes('no')) {
          this.preparePrintCommand(this, { appId, clientAccountId, force });
          logger.log(MESSAGES.operationAborted);
          return;
        }
      }

      logger.log(MESSAGES.removingData);
      await removeAppStorageDataForAccount(appId, clientAccountId);

      this.preparePrintCommand(this, { appId, clientAccountId, force });
    } catch (error: unknown) {
      logger.debug(error);
      if (error instanceof HttpError) {
        logger.error(`\n ${chalk.italic(chalk.red(error.message))}`);
      } else {
        logger.error(`An unknown error happened while removing storage data for a client account"`);
      }

      process.exit(1);
    }
  }
}
