import { BaseProfileCommand } from 'commands-base/base-profile-command';
import { CONFIG_NAME } from 'services/config-service';
import logger from 'utils/logger';

export default class ProfileClearDefault extends BaseProfileCommand {
  static description = 'Clear the default credential profile.';
  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {};

  DEBUG_TAG = 'profile:clear-default';

  public async run(): Promise<void> {
    await this.parse(ProfileClearDefault);

    const config = this.getExistingConfig();

    if (!config.defaultProfile) {
      logger.info('No default profile is set.');
      return;
    }

    const cleared = config.defaultProfile;
    const updated = { ...config };
    delete updated.defaultProfile;
    this.saveConfig(updated);
    logger.info(`Default profile cleared (was "${cleared}") in '${CONFIG_NAME}'.`);
  }
}
