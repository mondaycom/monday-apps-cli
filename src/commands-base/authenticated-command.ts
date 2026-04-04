import { Config } from '@oclif/core';

import { BaseCommand } from 'commands-base/base-command';
import { CONFIG_KEYS } from 'consts/config';
import { AuthenticationError } from 'errors/authentication-error';
import { ConfigService } from 'services/config-service';
import { PromptService } from 'services/prompt-service';
import { ConfigData } from 'types/services/config-service';
import logger from 'utils/logger';

const AUTH_METHOD_TOKEN = 'Access token (plaintext)';
const AUTH_METHOD_PROFILE = 'Credential profile (secrets manager)';

const promptForAuth = async (config: Config): Promise<void> => {
  logger.info('No authentication configured.');
  const method = await PromptService.promptList('How would you like to authenticate?', [
    AUTH_METHOD_PROFILE,
    AUTH_METHOD_TOKEN,
  ]);

  if (method === AUTH_METHOD_TOKEN) {
    await config.runCommand('init', ['--local']);
  } else {
    await config.runCommand('profile:add');
  }
};

const PLAINTEXT_TOKEN = 'Access token (plaintext)';

const promptProfileSelection = async (config: Config, configData: ConfigData): Promise<void> => {
  const names = Object.keys(configData.profiles!);
  const choices = [...names];
  if (configData.accessToken) {
    choices.push(PLAINTEXT_TOKEN);
  }

  const selected = await PromptService.promptList('Select a profile or access token to use', choices);

  if (selected === PLAINTEXT_TOKEN) {
    // Plaintext token is already in the env from loadConfigToProcessEnv
    return;
  }

  ConfigService.resolveAndSetProfile(config.configDir, selected);
};

const validateAccessToken = async (config: Config): Promise<void> => {
  const accessToken = ConfigService.getConfigDataByKey(CONFIG_KEYS.ACCESS_TOKEN);
  if (!accessToken) {
    await promptForAuth(config);

    // Re-load config and resolve profile after setup
    const configData = ConfigService.readConfigData(config.configDir);
    if (configData?.profiles) {
      ConfigService.resolveAndSetProfile(config.configDir);
    }
  }
};

export abstract class AuthenticatedCommand extends BaseCommand {
  public async init(): Promise<void> {
    await super.init();
    const { flags } = await this.parse(this.constructor as typeof AuthenticatedCommand);
    const profileName = flags['profile'] as string | undefined;
    const ignoreProfiles = flags['ignore-profiles'] as boolean;

    if (!ignoreProfiles && profileName) {
      ConfigService.resolveAndSetProfile(this.config.configDir, profileName);
    }

    // If profiles exist but none was resolved (no default, no --profile flag), prompt
    // Skip if a token was set externally (e.g. CI) — detected by comparing env to config file
    if (!ignoreProfiles && !profileName) {
      const configData = ConfigService.readConfigData(this.config.configDir);
      if (configData?.profiles && Object.keys(configData.profiles).length > 0 && !configData.defaultProfile) {
        const envToken = ConfigService.getConfigDataByKey(CONFIG_KEYS.ACCESS_TOKEN);
        const externallySet = envToken && envToken !== configData.accessToken;
        if (!externallySet) {
          await promptProfileSelection(this.config, configData);
        }
      }
    }

    await validateAccessToken(this.config);
  }

  protected catch(err: Error & { exitCode?: number }): any {
    if (err instanceof AuthenticationError) {
      logger.error(err);
      return process.exit(1);
    }

    return super.catch(err);
  }

  protected async finally(_: Error | undefined): Promise<any> {
    return super.finally(_);
  }
}
