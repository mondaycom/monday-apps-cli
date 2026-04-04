import { BaseProfileCommand } from 'commands-base/base-profile-command';
import { CONFIG_NAME } from 'services/config-service';
import { PromptService } from 'services/prompt-service';
import { ConfigData } from 'types/services/config-service';
import logger from 'utils/logger';

const ACTION_ADD_PROFILE = 'Add profile (secrets manager command)';
const ACTION_REMOVE = 'Remove profile';
const ACTION_SET_DEFAULT = 'Set default profile';
const ACTION_CLEAR_DEFAULT = 'Clear default profile';
const ACTION_LIST = 'List profiles';

export default class Profile extends BaseProfileCommand {
  static description = 'Manage authentication profiles for monday.com API access (interactive).';
  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {};

  DEBUG_TAG = 'profile';

  private listProfiles(config: ConfigData): void {
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

  public async run(): Promise<void> {
    await this.parse(Profile);

    const config = this.getExistingConfig();
    const hasProfiles = config.profiles && Object.keys(config.profiles).length > 0;
    const hasToken = !!config.accessToken;
    const hasAnything = hasProfiles || hasToken;

    const choices = [ACTION_ADD_PROFILE];
    if (hasProfiles) {
      choices.unshift(ACTION_SET_DEFAULT);
      if (config.defaultProfile) {
        choices.splice(choices.indexOf(ACTION_SET_DEFAULT) + 1, 0, ACTION_CLEAR_DEFAULT);
      }
    }

    if (hasAnything) {
      choices.push(ACTION_REMOVE);
      choices.push(ACTION_LIST);
    }

    const action = await PromptService.promptList('What would you like to do?', choices);

    if (action === ACTION_ADD_PROFILE) {
      const name = await PromptService.promptInput('Profile name (e.g. dev, prod, staging)', true);
      const command = await PromptService.promptInput('Shell command that prints the access token to stdout', true);

      const updated: ConfigData = {
        ...config,
        profiles: { ...(config.profiles ?? {}), [name]: command },
      };

      if (!config.defaultProfile) {
        const setDefault = await PromptService.promptList(`Set "${name}" as default profile?`, ['No', 'Yes']);
        if (setDefault === 'Yes') {
          updated.defaultProfile = name;
        }
      }

      this.saveConfig(updated);
      logger.info(`Profile "${name}" saved to '${CONFIG_NAME}'.`);
    } else if (action === ACTION_SET_DEFAULT) {
      const names = Object.keys(config.profiles!);
      const current = config.defaultProfile;
      const defaultName = await PromptService.promptList(
        `Select default profile${current ? ` (currently: ${current})` : ''}`,
        names,
      );
      this.saveConfig({ ...config, defaultProfile: defaultName });
      logger.info(`Default profile set to "${defaultName}".`);
    } else if (action === ACTION_CLEAR_DEFAULT) {
      const cleared = config.defaultProfile;
      const updated = { ...config };
      delete updated.defaultProfile;
      this.saveConfig(updated);
      logger.info(`Default profile cleared (was "${cleared}").`);
    } else if (action === ACTION_REMOVE) {
      const CANCEL = 'Cancel';
      const removeChoices: string[] = [CANCEL];
      if (config.accessToken) removeChoices.push('Access token (plaintext)');
      if (config.profiles) removeChoices.push(...Object.keys(config.profiles));

      const toRemove = await PromptService.promptList('Select profile to remove', removeChoices);

      if (toRemove === CANCEL) {
        logger.info('Cancelled.');
        return;
      }

      const updated: ConfigData = { ...config };

      if (toRemove === 'Access token (plaintext)') {
        delete updated.accessToken;
        logger.info('Access token removed.');
      } else {
        const { [toRemove]: _, ...remaining } = config.profiles!;
        updated.profiles = remaining;
        if (config.defaultProfile === toRemove) {
          delete updated.defaultProfile;
          logger.info(`Cleared default profile (was "${toRemove}").`);
        }

        logger.info(`Profile "${toRemove}" removed.`);
      }

      this.saveConfig(updated);
    } else if (action === ACTION_LIST) {
      this.listProfiles(config);
    }
  }
}
