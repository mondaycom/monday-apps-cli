import { Flags } from '@oclif/core';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { defaultVersionByAppId } from 'services/app-versions-service';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { getCurrentWorkingDirectory } from 'services/env-service';
import { getManifestAssetPath, readManifestFile } from 'services/manifest-service';
import { getTasksForClientSide, getTasksForServerSide } from 'services/share/deploy';
import { ManifestHostingType } from 'types/services/manifest-service';
import logger from 'utils/logger';

const MESSAGES = {
  directory: 'Directory path of you project in your machine. If not included will use the current working directory.',
  appId: 'App id (will use the latest draft version)',
};

export default class AppDeploy extends AuthenticatedCommand {
  static description = 'Deploy an app using manifest file.';
  static withPrintCommand = false;
  static examples = ['<%= config.bin %> <%= command.id %>'];
  static flags = AppDeploy.serializeFlags({
    directoryPath: Flags.string({
      char: 'd',
      description: MESSAGES.directory,
    }),
    appId: Flags.string({
      char: 'a',
      description: MESSAGES.appId,
    }),
    appVersionId: Flags.string({
      char: 'v',
      description: 'App version id',
    }),
  });

  DEBUG_TAG = 'app_deploy';

  async getAppId(appId: string | undefined): Promise<string> {
    if (appId) return appId;
    const chosenAppId = await DynamicChoicesService.chooseApp();
    return chosenAppId.toString();
  }

  async getAppVersionId(appVersionId: string | undefined, appId: string | undefined): Promise<string> {
    if (appVersionId) return appVersionId;
    const chosenAppId = await this.getAppId(appId);

    const latestDraftVersion = await defaultVersionByAppId(Number(chosenAppId));
    if (!latestDraftVersion) throw new Error('No editable version found for the given app id.');
    return latestDraftVersion.id.toString();
  }

  public async run(): Promise<void> {
    try {
      const { flags } = await this.parse(AppDeploy);

      const manifestFileDir = flags.directoryPath || getCurrentWorkingDirectory();
      const manifestFileData = readManifestFile(manifestFileDir);
      flags.appId = flags.appId || manifestFileData.app.id;

      flags.appVersionId = await this.getAppVersionId(flags.appVersionId, flags.appId);

      this.preparePrintCommand(this, { appVersionId: flags.appVersionId, directoryPath: manifestFileData });

      const { cdn, server } = manifestFileData.app?.hosting || {};
      if (cdn && cdn.type === ManifestHostingType.Upload) {
        logger.info('Deploying files to cdn...');
        await getTasksForClientSide(Number(flags.appVersionId), getManifestAssetPath(manifestFileDir, cdn.path)).run();
      }

      if (server && server.type === ManifestHostingType.Upload) {
        logger.info('Deploying server side files...');
        await getTasksForServerSide(
          Number(flags.appVersionId),
          getManifestAssetPath(manifestFileDir, server.path),
        ).run();
      }
    } catch (error) {
      logger.debug(error, this.DEBUG_TAG);

      process.exit(1);
    }
  }
}
