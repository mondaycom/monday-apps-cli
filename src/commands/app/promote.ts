import { Flags } from '@oclif/core';
import { Listr } from 'listr2';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_VERSION_STATUS } from 'consts/app-versions';
import { promoteAppTask, pullPromoteStatusTask, shouldPromoteLatestDraftVersion } from 'services/app-promote-service';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { PromoteCommandTasksContext } from 'types/commands/promote';
import logger from 'utils/logger';

export default class AppPromote extends AuthenticatedCommand {
  static description = 'Promote an app to live.';
  static examples = ['<%= config.bin %> <%= command.id %>', '<%= config.bin %> <%= command.id %>'];

  static flags = AppPromote.serializeFlags({
    appId: Flags.string({
      char: 'a',
      description: 'App id to promote',
    }),
    appVersionId: Flags.string({
      char: 'i',
      aliases: ['v'],
      description: 'App version id to promote',
    }),
  });

  DEBUG_TAG = 'app_promote';

  public async run(): Promise<void> {
    try {
      const { flags } = await this.parse(AppPromote);

      let appId = flags.appId ? Number(flags.appId) : undefined;
      let appVersionId = flags.appVersionId ? Number(flags.appVersionId) : undefined;

      if (appVersionId && !appId) {
        logger.error('You must provide an app id when providing an app version id');
        process.exit(1);
      }

      if (!appId && !appVersionId) {
        appId = Number(await DynamicChoicesService.chooseApp());
        const shouldUseLatestVersion = await shouldPromoteLatestDraftVersion();
        appVersionId = shouldUseLatestVersion
          ? undefined
          : await DynamicChoicesService.chooseAppVersion(appId, [APP_VERSION_STATUS.DRAFT]);
      }

      this.preparePrintCommand(this, { appId, appVersionId });
      const ctx = { appId: appId!, appVersionId };
      await new Listr<PromoteCommandTasksContext>(
        [
          { title: 'Promote app', task: promoteAppTask },
          { title: 'Waiting for app to be promoted', task: pullPromoteStatusTask },
        ],
        { ctx },
      ).run();
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);
      throw error;
    }
  }
}
