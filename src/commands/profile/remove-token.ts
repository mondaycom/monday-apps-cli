import { BaseProfileCommand } from 'commands-base/base-profile-command';
import { CONFIG_NAME } from 'services/config-service';
import logger from 'utils/logger';

export default class ProfileRemoveToken extends BaseProfileCommand {
  static description = 'Remove the plaintext access token from .mappsrc.';
  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {};

  DEBUG_TAG = 'profile:remove-token';

  public async run(): Promise<void> {
    await this.parse(ProfileRemoveToken);

    const config = this.getExistingConfig();

    if (!config.accessToken) {
      logger.info('No plaintext access token configured.');
      return;
    }

    const updated = { ...config };
    delete updated.accessToken;
    this.saveConfig(updated);
    logger.info(`Plaintext access token removed from '${CONFIG_NAME}'.`);
  }
}
