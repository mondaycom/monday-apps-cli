import * as path from 'node:path';

import { Args, Flags } from '@oclif/core';
import { Listr } from 'listr2';

import { BaseCommand } from 'commands-base/base-command';
import { PROJECT_TEMPLATES } from 'consts/scaffold';
import { PromptService } from 'services/prompt-service';
import {
  downloadTemplateTask,
  editEnvFileTask,
  installDependenciesTask,
  openSetupFileTask,
  runProjectTask,
  validateDestination,
} from 'services/scaffold-service';
import { ProjectTemplate, ScaffoldTaskContext } from 'types/commands/scaffold';
import logger from 'utils/logger';

export default class AppScaffold extends BaseCommand {
  static description =
    'Scaffold a monday app from a template, install dependencies, and start the project automatically.';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> ./my-app quickstart-react',
    '<%= config.bin %> <%= command.id %> ./my-app slack-node --signingSecret YOUR_SECRET',
    '<%= config.bin %> <%= command.id %> ./my-app word-cloud --command dev',
  ];

  static args = {
    destination: Args.string({
      description: 'The destination directory for the scaffolded project',
      required: false,
    }),
    project: Args.string({
      description: 'The name of the template project to scaffold',
      required: false,
    }),
  };

  static flags = AppScaffold.serializeFlags({
    signingSecret: Flags.string({
      char: 's',
      description: 'monday signing secret (for .env configuration)',
      required: false,
    }),
    command: Flags.string({
      char: 'c',
      description: 'npm script command to run after installation (default: start)',
      required: false,
      default: 'start',
    }),
  });

  DEBUG_TAG = 'app_scaffold';

  public async run(): Promise<void> {
    try {
      const { args, flags } = await this.parse(AppScaffold);

      // Get project
      let project: ProjectTemplate;
      if (args.project) {
        const foundProject = PROJECT_TEMPLATES.find(p => p.name === args.project);
        if (!foundProject) {
          throw new Error(
            `Project "${args.project}" not found. Available projects: ${PROJECT_TEMPLATES.map(p => p.name).join(', ')}`,
          );
        }

        project = foundProject;
      } else {
        const projectName = await PromptService.promptList(
          'Which project do you want to start from?',
          PROJECT_TEMPLATES.map(p => p.name),
        );
        project = PROJECT_TEMPLATES.find(p => p.name === projectName)!;
      }

      // Get destination
      let destination: string;
      if (args.destination) {
        destination = path.resolve(args.destination);
      } else {
        const destInput = await PromptService.promptInput('Choose destination folder', false);
        destination = path.resolve(destInput || './');
      }

      // Validate destination
      await validateDestination(destination);

      // Get signing secret if needed
      let signingSecret = flags.signingSecret;
      if (!signingSecret && project.isWithSigningSecret) {
        signingSecret = await PromptService.promptInput(
          'Enter signing secret (optional, press Enter to skip)',
          false,
          true,
        );
      }

      const projectPath = path.join(destination, project.name);

      // Use command flag (defaults to 'start')
      const startCommand = flags.command;

      this.preparePrintCommand(this, flags, args);

      const context: ScaffoldTaskContext = {
        project,
        destination,
        signingSecret,
        projectPath,
        startCommand,
      };

      await this.executeScaffold(context);
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);
      throw error;
    }
  }

  private async executeScaffold(ctx: ScaffoldTaskContext): Promise<void> {
    const tasks = new Listr<ScaffoldTaskContext>([
      { title: 'Downloading template', task: downloadTemplateTask },
      { title: 'Configuring environment', task: editEnvFileTask },
      {
        title: 'Opening setup documentation',
        task: openSetupFileTask,
        enabled: () => Boolean(ctx.project.openSetupMd),
      },
      { title: 'Installing dependencies', task: installDependenciesTask },
      { title: 'Starting project', task: runProjectTask },
    ]);

    await tasks.run(ctx);

    logger.success(
      `Project is running at: ${ctx.projectPath}\n` +
        `To run manually later:\n` +
        `  cd ${ctx.project.name}\n` +
        `  npm run ${ctx.startCommand}\n\n` +
        `Press Enter to provide your access token and view the tunnel URL\n`,
    );

    // Keep scaffold process alive so dev server continues running
    await new Promise(() => {});
  }
}
