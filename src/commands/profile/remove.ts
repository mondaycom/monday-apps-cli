import { Flags } from '@oclif/core';

import { BaseProfileCommand } from 'commands-base/base-profile-command';
import { CONFIG_NAME } from 'services/config-service';
import { PromptService } from 'services/prompt-service';
import logger from 'utils/logger';

export default class ProfileRemove extends BaseProfileCommand {
  static description = 'Remove a credential profile from .mappsrc.';
  static examples = ['<%= config.bin %> <%= command.id %>', '<%= config.bin %> <%= command.id %> --name dev'];

  static flags = {
    name: Flags.string({
      char: 'n',
      description: 'Profile name to remove.',
    }),
  };

  DEBUG_TAG = 'profile:remove';

  public async run(): Promise<void> {
    const { flags } = await this.parse(ProfileRemove);

    const config = this.getExistingConfig();
    const available = config.profiles ? Object.keys(config.profiles) : [];

    if (available.length === 0) {
      logger.info('No profiles configured.');
      return;
    }

    let name = flags.name;
    if (!name) {
      const CANCEL = 'Cancel';
      name = await PromptService.promptList('Select profile to remove', [CANCEL, ...available]);
      if (name === CANCEL) {
        logger.info('Cancelled.');
        return;
      }
    }

    if (!available.includes(name)) {
      logger.error(`Profile "${name}" not found. Available: ${available.join(', ')}`);
      return process.exit(1);
    }

    const { [name]: _, ...remaining } = config.profiles!;
    const updated = { ...config, profiles: remaining };

    if (config.defaultProfile === name) {
      delete updated.defaultProfile;
      logger.info(`Cleared default profile (was "${name}").`);
    }

    this.saveConfig(updated);
    logger.info(`Profile "${name}" removed from '${CONFIG_NAME}'.`);
  }
}
