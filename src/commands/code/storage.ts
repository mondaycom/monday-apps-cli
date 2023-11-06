import { Flags } from '@oclif/core';
import chalk from 'chalk';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { PromptService } from 'services/prompt-service';
import { getStorageItemsSearch } from 'services/storage-service';
import { HttpError } from 'types/errors';
import logger from 'utils/logger';

const clientAccountNumberMessage = 'Client account number';
const termMessage = 'Term to search for';

const fetchAndPrintStorageKeyValuesResults = async (appId: number, clientAccountId: number, term: string) => {
  const itemsFound = await getStorageItemsSearch(appId, clientAccountId, term);
  logger.table(itemsFound.records);
  if (itemsFound.hasMoreRecords) {
    console.log('There more records, please search for a more specific term.');
  }
};

export default class Storage extends AuthenticatedCommand {
  static description = 'Get keys and values stored on monday for a specific customer.';

  static examples = ['<%= config.bin %> <%= command.id %> -a APP_ID -c CLIENT_ACCOUNT_ID -t TERM'];

  static flags = Storage.serializeFlags({
    appId: Flags.integer({
      char: 'a',
      aliases: ['v'],
      description: 'Select the app that you wish to retrieve the key for',
    }),
    clientAccountId: Flags.integer({
      char: 'c',
      description: `${clientAccountNumberMessage}.`,
    }),
    term: Flags.string({
      char: 't',
      description: `${termMessage}.`,
    }),
  });

  public async run(): Promise<void> {
    const { flags } = await this.parse(Storage);
    let { appId, clientAccountId, term } = flags;
    if (!appId) {
      appId = await DynamicChoicesService.chooseApp();
    }

    if (!clientAccountId) {
      clientAccountId = await PromptService.promptInputNumber(`${clientAccountNumberMessage}:`, true);
    }

    while (!term) {
      // eslint-disable-next-line no-await-in-loop
      term = await PromptService.promptInput(`${termMessage}:`, true);
      if (!/^[\w:-]+$/.test(term)) {
        logger.warn('Key name can only contain alphanumeric chars and the symbols -_:');
        term = '';
      }
    }

    await fetchAndPrintStorageKeyValuesResults(appId, clientAccountId, term);
    try {
      this.preparePrintCommand(this, { appId, clientAccountId, term });
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        logger.error(`\n ${chalk.italic(chalk.red(error.message))}`);
      } else {
        logger.error(`An unknown error happened while fetching storage items status for app id - "${appId}"`);
      }

      process.exit(1);
    }
  }
}
