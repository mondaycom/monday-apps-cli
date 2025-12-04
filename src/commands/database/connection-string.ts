import { Flags } from '@oclif/core';
import chalk from 'chalk';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { VAR_UNKNOWN } from 'consts/messages';
import { getDatabaseConnectionString } from 'services/database-service';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { defaultVersionByAppId } from 'src/services/app-versions-service';
import { chooseRegionIfNeeded, getRegionFromString } from 'src/utils/region';
import { HttpError } from 'types/errors';
import logger from 'utils/logger';

export default class ConnectionString extends AuthenticatedCommand {
  static description = 'Get the connection string for your app database.';

  static examples = ['<%= config.bin %> <%= command.id %> -a APP_ID'];

  static flags = ConnectionString.serializeFlags({
    appId: Flags.integer({
      char: 'a',
      description: 'Select the app that you wish to retrieve the connection string for',
    }),
  });

  public async run(): Promise<void> {
    const { flags } = await this.parse(ConnectionString);
    let { appId } = flags;
    const { region } = flags;
    const parsedRegion = getRegionFromString(region);

    try {
      if (!appId) {
        appId = await DynamicChoicesService.chooseApp();
      }

      const defaultVersion = await defaultVersionByAppId(Number(appId));
      const selectedRegion = await chooseRegionIfNeeded(parsedRegion, { appId, appVersionId: defaultVersion?.id });
      const result = await getDatabaseConnectionString(appId, selectedRegion);

      logger.log(chalk.cyan('✓ Connection string retrieved successfully:'));
      logger.log(chalk.green(result.connectionString));
      logger.log(
        chalk.cyan(`The connection may take a few moments to become available, and will expire at: ${result.expiresAt}`),
      );

      this.preparePrintCommand(this, { appId });
    } catch (error: unknown) {
      logger.debug(error);
      if (error instanceof HttpError) {
        logger.error(`\n ${chalk.italic(chalk.red(error.message))}`);
      } else {
        logger.error(
          `An unknown error happened while fetching the database connection string for app id - "${
            appId || VAR_UNKNOWN
          }"`,
        );
      }

      process.exit(1);
    }
  }
}
