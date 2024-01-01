import { Flags } from '@oclif/core';

import { getTasksForClientSide, getTasksForServerSide } from 'commands/share/deploy';
import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { defaultVersionByAppId } from 'services/app-versions-service';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { getCurrentWorkingDirectory } from 'services/env-service';
import { getManifestAssetPath, readManifestFile } from 'services/manifest-service';
import { ManifestPackageType } from 'types/services/manifest-service';
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
  });

  DEBUG_TAG = 'app_deploy';

  public async run(): Promise<void> {
    try {
      const { flags } = await this.parse(AppDeploy);

      const manifestFileDir = flags.directoryPath || getCurrentWorkingDirectory();
      const manifestFileData = readManifestFile(manifestFileDir);
      flags.appId = flags.appId || manifestFileData.app.id;

      if (!flags.appId) {
        const chosenAppId = await DynamicChoicesService.chooseApp();
        flags.appId = chosenAppId.toString();
      }

      const latestDraftVersion = await defaultVersionByAppId(Number(flags.appId));
      if (!latestDraftVersion) throw new Error('No editable version found for the given app id.');
      const appVersionId = latestDraftVersion.id;

      this.preparePrintCommand(this, { appVersionId, directoryPath: manifestFileData });

      const { client, server } = manifestFileData.app?.packages || {};
      if (client && client.type === ManifestPackageType.Upload) {
        logger.info('Deploying client side files...');
        await getTasksForClientSide(appVersionId, getManifestAssetPath(manifestFileDir, client.path)).run();
      }

      if (server && server.type === ManifestPackageType.Upload) {
        logger.info('Deploying server side files...');
        await getTasksForServerSide(appVersionId, getManifestAssetPath(manifestFileDir, server.path)).run();
      }
    } catch (error) {
      logger.debug(error, this.DEBUG_TAG);

      process.exit(1);
    }
  }
}
