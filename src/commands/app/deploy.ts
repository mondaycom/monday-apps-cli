import { Flags } from '@oclif/core';

import { addRegionToFlags, chooseRegionIfNeeded } from 'commands/utils/region';
import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { getCurrentWorkingDirectory } from 'services/env-service';
import { getManifestAssetPath, readManifestFile } from 'services/manifest-service';
import { getTasksForClientSide, getTasksForServerSide } from 'services/share/deploy';
import { ManifestHostingType } from 'types/services/manifest-service';
import logger from 'utils/logger';
import { getRegionFromString } from 'utils/region';

const MESSAGES = {
  directory: 'Directory path of you project in your machine. If not included will use the current working directory.',
  appId: 'App id (will use the latest draft version)',
  appVersionId: 'App version id',
  force: 'Force push to latest version (draft or live)',
};

export default class AppDeploy extends AuthenticatedCommand {
  static description = 'Deploy an app using manifest file.';
  static withPrintCommand = false;
  static examples = ['<%= config.bin %> <%= command.id %>'];
  static flags = AppDeploy.serializeFlags(
    addRegionToFlags({
      directoryPath: Flags.string({
        char: 'd',
        description: MESSAGES.directory,
      }),
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
      force: Flags.boolean({
        char: 'f',
        aliases: ['force'],
        description: MESSAGES.force,
      }),
    }),
  );

  DEBUG_TAG = 'app_deploy';

  async getAppVersionId(appVersionId: string | undefined, appId: string | undefined, force: boolean): Promise<string> {
    if (appVersionId) return appVersionId;

    const latestDraftVersion = await DynamicChoicesService.chooseAppAndAppVersion(false, Boolean(force), {
      appId: Number(appId),
      autoSelectVersion: true,
    });

    return latestDraftVersion.appVersionId.toString();
  }

  public async run(): Promise<void> {
    try {
      const { flags } = await this.parse(AppDeploy);
      const { directoryPath, appId, appVersionId, region: strRegion, force } = flags;
      const region = getRegionFromString(strRegion);
      const manifestFileDir = directoryPath || getCurrentWorkingDirectory();
      const manifestFileData = readManifestFile(manifestFileDir);
      flags.appId = appId || manifestFileData.app.id;

      flags.appVersionId = await this.getAppVersionId(appVersionId, appId, force);

      const selectedRegion = await chooseRegionIfNeeded(region, {
        appId: Number(flags.appId),
        appVersionId: Number(flags.appVersionId),
      });
      this.preparePrintCommand(this, { appVersionId: appVersionId, directoryPath: manifestFileData });

      const { cdn, server } = manifestFileData.app?.hosting || {};
      if (cdn && cdn.type === ManifestHostingType.Upload) {
        logger.info('Deploying files to cdn...');
        await getTasksForClientSide(
          Number(appVersionId),
          getManifestAssetPath(manifestFileDir, cdn.path),
          selectedRegion,
        ).run();
      }

      if (server && server.type === ManifestHostingType.Upload) {
        logger.info('Deploying server side files...');
        await getTasksForServerSide(
          Number(appVersionId),
          getManifestAssetPath(manifestFileDir, server.path),
          selectedRegion,
        ).run();
      }
    } catch (error) {
      logger.debug(error, this.DEBUG_TAG);

      process.exit(1);
    }
  }
}
