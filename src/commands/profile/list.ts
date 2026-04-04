import { BaseProfileCommand } from 'commands-base/base-profile-command';
import logger from 'utils/logger';

export default class ProfileList extends BaseProfileCommand {
  static description = 'List all configured credential profiles.';
  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {};

  DEBUG_TAG = 'profile:list';

  public async run(): Promise<void> {
    await this.parse(ProfileList);

    const config = this.getExistingConfig();
    const { accessToken, profiles, defaultProfile } = config;

    if (accessToken) {
      logger.info(`Access token: ${'*'.repeat(8)}...${accessToken.slice(-4)}`);
    }

    if (profiles && Object.keys(profiles).length > 0) {
      logger.info('Profiles:');
      for (const [name, command] of Object.entries(profiles)) {
        const isDefault = name === defaultProfile ? ' (default)' : '';
        logger.info(`  ${name}${isDefault}: ${command}`);
      }
    } else if (!accessToken) {
      logger.info('No profiles configured. Run "mapps profile" to set up authentication.');
    }
  }
}
