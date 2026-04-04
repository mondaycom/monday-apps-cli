import { Flags } from '@oclif/core';

import { BaseProfileCommand } from 'commands-base/base-profile-command';
import { CONFIG_NAME } from 'services/config-service';
import { PromptService } from 'services/prompt-service';
import logger from 'utils/logger';

export default class ProfileAdd extends BaseProfileCommand {
  static description = 'Add a credential profile to .mappsrc.';
  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --name dev --command "op read op://vault/dev/token"',
    '<%= config.bin %> <%= command.id %> --name dev --command "echo MY_TOKEN" --set-as-default',
  ];

  static flags = {
    name: Flags.string({
      char: 'n',
      description: 'Profile name (e.g. dev, prod, staging).',
    }),
    command: Flags.string({
      char: 'c',
      description: 'Shell command that prints the access token to stdout.',
    }),
    'set-as-default': Flags.boolean({
      description: 'Set this profile as the default.',
      default: false,
    }),
  };

  DEBUG_TAG = 'profile:add';

  public async run(): Promise<void> {
    const { flags } = await this.parse(ProfileAdd);

    const name = flags.name || (await PromptService.promptInput('Profile name (e.g. dev, prod, staging)', true));
    const command =
      flags.command || (await PromptService.promptInput('Shell command that prints the access token to stdout', true));

    const config = this.getExistingConfig();
    const updated = {
      ...config,
      profiles: { ...(config.profiles ?? {}), [name]: command },
    };

    if (flags['set-as-default']) {
      updated.defaultProfile = name;
    } else if (!flags.name && !config.defaultProfile) {
      const setDefault = await PromptService.promptList(`Set "${name}" as default profile?`, ['No', 'Yes']);
      if (setDefault === 'Yes') {
        updated.defaultProfile = name;
      }
    }

    this.saveConfig(updated);
    logger.info(`Profile "${name}" added to '${CONFIG_NAME}'.`);
  }
}
