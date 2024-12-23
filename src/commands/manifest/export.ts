import { Flags } from '@oclif/core';
import { Listr } from 'listr2';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import * as exportService from 'services/export-manifest-service';
import { ExportCommandTasksContext } from 'types/commands/manifest-export';
import logger from 'utils/logger';

const MESSAGES = {
  appId: 'App id (will export the live version)',
  appVersionId: 'App version id',
};

export default class ManifestExport extends AuthenticatedCommand {
  static description = 'export manifest.';
  static withPrintCommand = false;
  static examples = ['<%= config.bin %> <%= command.id %>'];
  static flags = ManifestExport.serializeFlags({
    appId: Flags.string({
      char: 'a',
      aliases: ['appId'],
      description: MESSAGES.appId,
    }),
    appVersionId: Flags.string({
      char: 'v',
      aliases: ['versionId'],
      description: MESSAGES.appVersionId,
    }),
  });

  DEBUG_TAG = 'manifest_export';

  async getAppVersionId(appVersionId: number | undefined, appId: number | undefined): Promise<number> {
    if (appVersionId) return appVersionId;

    const latestDraftVersion = await DynamicChoicesService.chooseAppAndAppVersion(false, false, {
      appId: Number(appId),
      autoSelectVersion: false,
    });

    return latestDraftVersion.appVersionId;
  }

  public async run(): Promise<void> {
    try {
      const { flags } = await this.parse(ManifestExport);
      const { appId: appIdAsString, appVersionId: appVersionIdAsString } = flags;

      const appId = appIdAsString ? Number(appIdAsString) : await DynamicChoicesService.chooseApp();
      const appVersionId = appVersionIdAsString
        ? Number(appVersionIdAsString)
        : await this.getAppVersionId(undefined, appId);

      this.preparePrintCommand(this, flags);

      const tasks = new Listr<ExportCommandTasksContext>(
        [{ title: 'Export app manifest', task: exportService.downloadManifestTask }],
        { ctx: { appVersionId, appId } },
      );

      await tasks.run();
    } catch (error) {
      logger.debug(error, this.DEBUG_TAG);
      process.exit(1);
    }
  }
}
