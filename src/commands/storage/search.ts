import { Flags } from '@oclif/core';
import chalk from 'chalk';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { VAR_UNKNOWN } from 'consts/messages';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { PromptService } from 'services/prompt-service';
import { getStorageItemsSearch } from 'services/storage-service';
import { HttpError } from 'types/errors';
import { AppStorageApiRecordsSearchResponseSearchSchema } from 'types/services/storage-service';
import logger from 'utils/logger';

const clientAccountNumberMessage = 'Client account number';
const termMessage = 'Term to search for';

const printStorageKeyValuesResults = (itemsFound: AppStorageApiRecordsSearchResponseSearchSchema) => {
  const maxValueLengthToPrint = 35;
  for (const record of itemsFound.records) {
    record.valueLength = record?.value?.length;
    if (record?.value?.length > maxValueLengthToPrint) {
      record.value = `${record.value.slice(0, maxValueLengthToPrint - 1)}`;
    }
  }

  logger.table(itemsFound.records);
};

export default class Search extends AuthenticatedCommand {
  static description = 'Search keys and values stored on monday for a specific customer account.';

  static examples = ['<%= config.bin %> <%= command.id %> -a APP_ID -c CLIENT_ACCOUNT_ID -t TERM'];

  static flags = Search.serializeFlags({
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
    const { flags } = await this.parse(Search);
    let { appId, clientAccountId, term } = flags;
    try {
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

      const itemsFound = await getStorageItemsSearch(appId, clientAccountId, term);
      printStorageKeyValuesResults(itemsFound);

      if (itemsFound.cursor) {
        logger.log('There more records, please search for a more specific term.');
      }

      this.preparePrintCommand(this, { appId, clientAccountId, term });
    } catch (error: unknown) {
      logger.debug(error);
      if (error instanceof HttpError) {
        logger.error(`\n ${chalk.italic(chalk.red(error.message))}`);
      } else {
        logger.error(
          `An unknown error happened while fetching storage items status for app id - "${appId || VAR_UNKNOWN}"`,
        );
      }

      process.exit(1);
    }
  }
}
