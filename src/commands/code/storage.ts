import { Flags } from '@oclif/core';
import { StatusCodes } from 'http-status-codes';

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

  static examples = ['<%= config.bin %> <%= command.id %> -i APP_VERSION_ID'];

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

    if (!term) {
      term = await PromptService.promptInput(`${termMessage}:`, true);
    }

    await fetchAndPrintStorageKeyValuesResults(appId, clientAccountId, term);
    try {
      this.preparePrintCommand(this, { appId, clientAccountId, term });
    } catch (error: unknown) {
      if (error instanceof HttpError && error.code === StatusCodes.NOT_FOUND) {
        logger.error(`No deployment found for provided app version id - "${appId}"`);
      } else {
        logger.error(`An unknown error happened while fetching deployment status for app version id - "${appId}"`);
      }

      process.exit(0);
    }
  }
}
