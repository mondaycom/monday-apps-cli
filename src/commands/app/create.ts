import path from 'node:path';

import { Flags } from '@oclif/core';
import { Listr } from 'listr2';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { cloneAppTemplateAndLoadManifest, createApp, createFeatures } from 'services/apps-service';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { PromptService } from 'services/prompt-service';
import { AppCreateCommandTasksContext } from 'types/commands/app-create';
import logger from 'utils/logger';
import { getLastParam } from 'utils/urls-builder';

export default class AppCreate extends AuthenticatedCommand {
  static description = 'Create an app.';

  static examples = ['<%= config.bin %> <%= command.id %>', '<%= config.bin %> <%= command.id %> -n NEW_APP_NAME'];

  static flags = AppCreate.serializeFlags({
    name: Flags.string({
      char: 'n',
      description: 'Name your new app.',
      required: false,
    }),
    targetDir: Flags.string({
      char: 'd',
      description: 'Directory to create the app in.',
      required: false,
    }),
  });

  DEBUG_TAG = 'app_create';

  public async run(): Promise<void> {
    try {
      const { flags } = await this.parse(AppCreate);
      let name = flags.name;

      if (!name) {
        name = await PromptService.promptInput('Enter app name:');
      }

      this.preparePrintCommand(this, { targetDir: flags.targetDir, name });

      const { githubUrl, folder, branch } = await DynamicChoicesService.chooseAppTemplate();
      const targetDir = flags.targetDir || process.cwd();
      const selectedTemplatePath = path.join(targetDir, getLastParam(folder));

      const tasks = new Listr<AppCreateCommandTasksContext>([
        { title: 'Downloading template', task: cloneAppTemplateAndLoadManifest },
        { title: 'Creating app', task: createApp },
        { title: 'Creating features', task: createFeatures },
      ]);

      await tasks.run({ appName: name, targetPath: selectedTemplatePath, folder: folder, branch, githubUrl });
      logger.success(
        `Your app is ready, 'cd ${getLastParam(tasks.ctx.targetPath)}' to see your app files. \n` +
          `Go to developer center to see your app: '${tasks.ctx.appName}' (id: ${tasks.ctx.appId})`,
      );
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);
      throw error;
    }
  }
}
