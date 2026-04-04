import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { BadConfigError } from 'errors/bad-config-error';
import { getCurrentWorkingDirectory } from 'services/env-service';
import { ConfigData, InitConfigOptions } from 'types/services/config-service';
import logger from 'utils/logger';

export const CONFIG_NAME = '.mappsrc';
const ENCODING = 'utf8';
const CONFIG_PROCESS_ENV_DOMAIN = 'MONDAY_CODE';

// NOTE: configExists is not path-aware — once set to true by any path, it returns true for all
// subsequent checks regardless of directory. This is a pre-existing limitation. Callers that need
// accurate per-path checks should use existsSync directly (see BaseProfileCommand.resolveConfigDir).
let configExists = false;

const checkConfigExists = (directoryPath: string, fileName = CONFIG_NAME) => {
  if (configExists) return configExists;
  const filePath = join(directoryPath, fileName);
  configExists = existsSync(filePath);

  return configExists;
};

const checkLocalConfigExists = (fileName = CONFIG_NAME) => {
  const filePath = join(getCurrentWorkingDirectory(), fileName);
  const localConfigExists = existsSync(filePath);
  if (!configExists) configExists = localConfigExists;

  return localConfigExists;
};

const camelToUpperSnakeCase = (str: string) => str.replaceAll(/[A-Z]/g, letter => `_${letter}`).toUpperCase();

const generateConfigKeyInProcessEnv = (configKey: keyof ConfigData) => {
  const keyInSnakeCase = camelToUpperSnakeCase(configKey);
  const configKeyInProcessEnv = `${CONFIG_PROCESS_ENV_DOMAIN}_${keyInSnakeCase}`;
  return configKeyInProcessEnv;
};

const setConfigDataInProcessEnv = (data: ConfigData, force = false) => {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'string') continue;
    const configKeyInProcessEnv = generateConfigKeyInProcessEnv(key as keyof ConfigData);
    if (!force && process.env[configKeyInProcessEnv]) continue;
    process.env[configKeyInProcessEnv] = value;
  }
};

const readConfig = (directoryPath: string, fileName = CONFIG_NAME) => {
  if (!checkConfigExists(directoryPath, fileName)) {
    throw new BadConfigError(`the file: ${fileName} is not found in ${directoryPath}`);
  }

  const filePath = join(directoryPath, fileName);
  const stringifiedData = readFileSync(filePath, { encoding: ENCODING });
  const data = JSON.parse(stringifiedData) as ConfigData;

  return data;
};

const writeConfig = (data: ConfigData, directoryPath: string, fileName = CONFIG_NAME) => {
  const filePath = join(directoryPath, fileName);
  const stringifiedData = JSON.stringify(data);
  writeFileSync(filePath, stringifiedData, { encoding: ENCODING });

  return data;
};

const resolveProfile = (data: ConfigData, profileName?: string): string | null => {
  const { profiles, defaultProfile } = data;

  if (!profiles || Object.keys(profiles).length === 0) {
    logger.error('No profiles configured in .mappsrc.');
    return process.exit(1);
  }

  const name = profileName || defaultProfile;
  if (!name) {
    return null;
  }

  const command = profiles[name];
  if (!command) {
    const available = Object.keys(profiles).join(', ');
    logger.error(`Profile "${name}" not found. Available: ${available}`);
    return process.exit(1);
  }

  try {
    const token = execSync(command, { encoding: 'utf8', timeout: 10_000 }).trim();
    if (token) return token;
    logger.error(`Profile "${name}" returned an empty token.`);
    return process.exit(1);
  } catch (error) {
    logger.error(`Profile "${name}" failed: ${(error as Error).message}`);
    logger.error('Use --ignore-profiles to bypass, or fix your profile configuration.');
    return process.exit(1);
  }
};

export const ConfigService = {
  checkConfigExists,

  checkLocalConfigExists,

  getConfigDataByKey(key: keyof ConfigData): string {
    const configKeyInProcessEnv = generateConfigKeyInProcessEnv(key);
    return process.env[configKeyInProcessEnv] as string;
  },

  loadConfigToProcessEnv(directoryPath: string, fileName = CONFIG_NAME, profileName?: string, ignoreProfiles = false) {
    const data = readConfig(directoryPath, fileName);
    setConfigDataInProcessEnv(data);

    if (!ignoreProfiles && data.profiles) {
      const token = resolveProfile(data, profileName);
      if (token) process.env[generateConfigKeyInProcessEnv('accessToken')] = token;
    }

    return data;
  },

  resolveAndSetProfile(directoryPath: string, profileName?: string) {
    try {
      const data = readConfig(directoryPath);
      if (!data.profiles) {
        logger.warn('--profile was provided but no profiles are configured in .mappsrc.');
        return;
      }

      const token = resolveProfile(data, profileName);
      if (token) process.env[generateConfigKeyInProcessEnv('accessToken')] = token;
    } catch {
      // Config not available — validateAccessToken will handle the missing token
      return;
    }
  },

  writeConfigData(data: ConfigData, directoryPath: string, fileName = CONFIG_NAME) {
    writeConfig(data, directoryPath, fileName);
  },

  readConfigData(directoryPath: string, fileName = CONFIG_NAME): ConfigData | undefined {
    try {
      return readConfig(directoryPath, fileName);
    } catch {
      return undefined;
    }
  },

  removeConfig(directoryPath: string, fileName = CONFIG_NAME) {
    const filePath = join(directoryPath, fileName);
    if (checkConfigExists(directoryPath, fileName)) {
      unlinkSync(filePath);
      configExists = false;
    }

    return true;
  },

  init(data: ConfigData, directoryPath: string, options: InitConfigOptions = {}) {
    const fileName = options.fileName || CONFIG_NAME;
    const filePath = join(directoryPath, fileName);

    if (!existsSync(directoryPath)) {
      mkdirSync(directoryPath, { recursive: true });
    }

    try {
      if (!existsSync(filePath)) {
        writeConfig(data, directoryPath, fileName);
      } else if (options.override) {
        const configDataToOverride = readConfig(directoryPath, fileName);
        const mergedData: ConfigData = {
          ...configDataToOverride,
          ...data,
          profiles: {
            ...(configDataToOverride.profiles ?? {}),
            ...(data.profiles ?? {}),
          },
        };
        writeConfig(mergedData, directoryPath, fileName);
      }

      if (options.setInProcessEnv) setConfigDataInProcessEnv(data, true);

      return data;
    } catch (error) {
      logger.debug('An error has occurred while creating .mappsrc config file', (error as Error).message);
    }
  },
};
