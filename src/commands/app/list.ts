import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { listApps } from 'services/apps-service';
import { App } from 'types/services/apps-service';
import logger from 'utils/logger';

const printApps = (apps: Array<App>) => {
  logger.table(apps);
};

export default class AppList extends AuthenticatedCommand {
  static description = 'List all apps for a specific user.';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = AppList.serializeFlags({});

  public async run(): Promise<void> {
    try {
      const apps = await listApps();
      if (apps.length === 0) {
        logger.error('No apps found');
        return this.exit(1);
      }

      printApps(apps);
    } catch (error: unknown) {
      logger.debug(error);
      logger.error('An unknown error happened while fetching apps');
      this.exit(0);
    }
  }
}
