import { Flags } from '@oclif/core';

import { BaseProfileCommand } from 'commands-base/base-profile-command';
import { CONFIG_NAME } from 'services/config-service';
import { PromptService } from 'services/prompt-service';
import logger from 'utils/logger';

export default class ProfileSetDefault extends BaseProfileCommand {
  static description = 'Set the default credential profile.';
  static examples = ['<%= config.bin %> <%= command.id %>', '<%= config.bin %> <%= command.id %> --name dev'];

  static flags = {
    name: Flags.string({
      char: 'n',
      description: 'Profile name to set as default.',
    }),
  };

  DEBUG_TAG = 'profile:set-default';

  public async run(): Promise<void> {
    const { flags } = await this.parse(ProfileSetDefault);

    const config = this.getExistingConfig();
    const available = config.profiles ? Object.keys(config.profiles) : [];

    if (available.length === 0) {
      logger.info('No profiles configured. Add a profile first with "mapps profile:add".');
      return;
    }

    let name = flags.name;
    if (!name) {
      const current = config.defaultProfile;
      name = await PromptService.promptList(
        `Select default profile${current ? ` (currently: ${current})` : ''}`,
        available,
      );
    }

    if (!available.includes(name)) {
      logger.error(`Profile "${name}" not found. Available: ${available.join(', ')}`);
      return process.exit(1);
    }

    this.saveConfig({ ...config, defaultProfile: name });
    logger.info(`Default profile set to "${name}" in '${CONFIG_NAME}'.`);
  }
}
