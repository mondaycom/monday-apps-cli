import { Flags } from '@oclif/core';
import { StatusCodes } from 'http-status-codes';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { VAR_UNKNOWN } from 'consts/messages';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { PromptService } from 'services/prompt-service';
import { deleteAppDeployments } from 'services/push-service';
import { HttpError } from 'types/errors';
import logger from 'utils/logger';

const DEBUG_TAG = 'code_delete';

export default class Delete extends AuthenticatedCommand {
  static description = 'Delete the monday-code deployments of an app in all regions, without deleting the app.';

  static examples = [
    '<%= config.bin %> <%= command.id %> -i APP_ID',
    '<%= config.bin %> <%= command.id %> -i APP_ID -f',
  ];

  static flags = Delete.serializeFlags({
    appId: Flags.integer({
      char: 'i',
      aliases: ['a'],
      description: 'The id of the app to delete the monday-code deployments for',
    }),
    force: Flags.boolean({
      char: 'f',
      description: 'Skip the confirmation prompt',
      default: false,
    }),
  });

  public async run(): Promise<void> {
    const { flags } = await this.parse(Delete);
    const { force } = flags;
    let { appId } = flags;
    try {
      if (!appId) {
        appId = Number(await DynamicChoicesService.chooseApp());
      }

      this.preparePrintCommand(this, { appId, force });

      const confirmed =
        force ||
        (await PromptService.promptConfirm(`Delete the monday-code deployments of app ${appId} in all regions?`));
      if (!confirmed) {
        logger.info('Deletion cancelled');
        return;
      }

      await deleteAppDeployments(appId);
      logger.success(`Deleting the monday-code deployments of app ${appId}`);
    } catch (error: unknown) {
      logger.debug({ res: error }, DEBUG_TAG);
      if (error instanceof HttpError && error.code === StatusCodes.NOT_FOUND) {
        logger.error(`No monday-code deployment found for app id - "${appId || VAR_UNKNOWN}"`);
      } else if (error instanceof HttpError && error.code === StatusCodes.BAD_REQUEST) {
        logger.error(error.message);
      } else if (error instanceof HttpError && error.code === StatusCodes.FORBIDDEN) {
        logger.error(`You are not authorized to delete the deployments of app id - "${appId || VAR_UNKNOWN}"`);
      } else {
        logger.error(
          `An unknown error happened while deleting the monday-code deployments of app id - "${appId || VAR_UNKNOWN}"`,
        );
      }

      process.exit(1);
    }
  }
}
