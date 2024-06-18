import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { listApps } from 'services/apps-service';
import { App } from 'types/services/apps-service';
import logger from 'utils/logger';

const printApps = (apps: Array<App>) => {
  const cleanedApps = apps.map(app => {
    return { id: app.id, name: app.name };
  });
  logger.table(cleanedApps);
};

export default class AppList extends AuthenticatedCommand {
  static description = 'List all apps for a specific user.';

  static withPrintCommand = false;

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = AppList.serializeFlags({});

  public async run(): Promise<void> {
    const apps = await listApps();
    if (apps.length === 0) {
      logger.error('No apps found');
      return process.exit(0);
    }

    printApps(apps);
  }
}
