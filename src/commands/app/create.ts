import path from 'node:path';

import { Flags } from '@oclif/core';
import { Listr } from 'listr2';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { cloneAppTemplateAndLoadManifest, createApp, createFeatures, finishCreateApp } from 'services/apps-service';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { PromptService } from 'services/prompt-service';
import { AppCreateCommandTasksContext } from 'types/commands/app-create';
import logger from 'utils/logger';

export default class AppCreate extends AuthenticatedCommand {
  static description = 'Create an app.';

  static withPrintCommand = false;

  static examples = ['<%= config.bin %> <%= command.id %>', '<%= config.bin %> <%= command.id %> -n NEW_APP_NAME'];

  static flags = AppCreate.serializeFlags({
    name: Flags.string({
      char: 'n',
      description: 'Name your new app.',
      required: false,
    }),
  });

  DEBUG_TAG = 'app_create';

  public async run(): Promise<void> {
    try {
      const { flags } = await this.parse(AppCreate);

      if (!flags.name) {
        flags.name = await PromptService.promptInput('Enter app name:');
      }

      const { githubUrl, folder, branch } = await DynamicChoicesService.chooseAppTemplate();
      const selectedTemplatePath = path.join('./', folder.split('/').pop()!);

      const tasks = new Listr<AppCreateCommandTasksContext>([
        { title: 'Downloading template', task: cloneAppTemplateAndLoadManifest },
        { title: 'Creating app', task: createApp },
        { title: 'Creating features', task: createFeatures },
        { title: 'Finalizing', task: finishCreateApp },
      ]);

      await tasks.run({ appName: flags.name, targetPath: selectedTemplatePath, folder: folder, branch, githubUrl });
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);

      // need to signal to the parent process that the command failed
      process.exit(1);
    }
  }
}
