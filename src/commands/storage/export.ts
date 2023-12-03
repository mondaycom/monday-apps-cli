import { Parser } from '@json2csv/plainjs';
import { Flags } from '@oclif/core';
import chalk from 'chalk';
import { format } from 'date-fns';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { VAR_UNKNOWN } from 'consts/messages';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { PromptService } from 'services/prompt-service';
import { getStorageItemsExport } from 'services/storage-service';
import { HttpError } from 'types/errors';
import { AppStorageApiRecordsSearchResponseExportSchema } from 'types/services/storage-service';
import { FSError, saveToFile } from 'utils/file-system';
import logger from 'utils/logger';

const clientAccountNumberMessage = 'Client account number';
const fileFormatDescription = 'Optional, file format "CSV" or "JSON" (the default value is "JSON")';
const fileDirectoryDescription = 'Optional, file path';

const saveToCSV = async (itemsFound: AppStorageApiRecordsSearchResponseExportSchema, csvPath: string) => {
  const parser = new Parser({
    fields: [
      {
        value: 'key',
        label: 'Key name',
      },
      {
        value: 'backendOnly',
        label: 'can be used only for backend',
      },
      {
        value: 'value',
        label: 'Value',
      },
    ],
  });
  const result: string = parser.parse(itemsFound.records);
  await saveToFile(csvPath, result);
};

const saveToJSON = async (itemsFound: AppStorageApiRecordsSearchResponseExportSchema, jsonPath: string) => {
  await saveToFile(jsonPath, JSON.stringify(itemsFound.records));
};

export default class Search extends AuthenticatedCommand {
  static description = 'Export all keys and values stored on monday for a specific customer account.';

  static examples = [
    '<%= config.bin %> <%= command.id %> -a APP_ID -c CLIENT_ACCOUNT_ID -d FILE_FULL_PATH -f FILE_FORMAT ',
  ];

  static flags = Search.serializeFlags({
    appId: Flags.integer({
      char: 'a',
      description: 'Select the app that you wish to retrieve the key for',
    }),
    clientAccountId: Flags.integer({
      char: 'c',
      description: `${clientAccountNumberMessage}.`,
    }),
    fileFormat: Flags.string({
      char: 'f',
      description: `${fileFormatDescription}.`,
    }),
    fileDirectory: Flags.string({
      char: 'd',
      description: `${fileDirectoryDescription}.`,
    }),
  });

  public async run(): Promise<void> {
    const { flags } = await this.parse(Search);
    let { appId, clientAccountId, fileFormat, fileDirectory } = flags;
    try {
      if (!appId) {
        appId = await DynamicChoicesService.chooseApp();
      }

      if (!clientAccountId) {
        clientAccountId = await PromptService.promptInputNumber(`${clientAccountNumberMessage}:`, true);
      }

      const itemsFound = await getStorageItemsExport(appId, clientAccountId);
      if (itemsFound && itemsFound.records) {
        if (!fileFormat) {
          fileFormat = 'json';
        }

        if (!['csv', 'json'].includes(fileFormat.toLowerCase())) {
          throw new FSError(`file format must be "CSV" or "JSON".`);
        }

        if (!fileDirectory) {
          fileDirectory = `${process.cwd()}/${format(new Date(), 'yyyyMMddHHmmss')}.${fileFormat.toLowerCase()}`;
        }

        let fileWasExportedSuccessfully = false;
        if (fileFormat.toLowerCase() === 'csv') {
          await saveToCSV(itemsFound, fileDirectory);
          fileWasExportedSuccessfully = true;
        }

        if (fileFormat.toLowerCase() === 'json') {
          await saveToJSON(itemsFound, fileDirectory);
          fileWasExportedSuccessfully = true;
        }

        if (fileWasExportedSuccessfully) {
          logger.log(
            chalk.blue(
              `Exported ${itemsFound.records.length} record(s) to file "${chalk.bold(
                fileDirectory,
              )}" in the format of "${chalk.bold(fileFormat.toUpperCase())}".`,
            ),
          );
        }
      } else {
        throw new Error('Unexpected error occurred or retrieved data in a bad format.');
      }

      this.preparePrintCommand(this, { appId, clientAccountId });
    } catch (error: unknown) {
      logger.debug(error);
      if (error instanceof HttpError || error instanceof FSError) {
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
