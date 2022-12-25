import { existsSync, writeFileSync, readFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { ConfigData, InitConfigOptions } from '../types/services/config-service.js';
import { join } from 'node:path';
import { BadConfigError } from '../errors/bad-config-error.js';
import Logger from '../utils/logger.js';

export const CONFIG_NAME = '.mcoderc';
const ENCODING = 'utf8';
const CONFIG_PROCESS_ENV_DOMAIN = 'MONDAY_CODE';

let configExists = false;

const checkConfigExists = (directoryPath: string, fileName = CONFIG_NAME) => {
  if (configExists) return configExists;
  const filePath = join(directoryPath, fileName);
  configExists = existsSync(filePath);

  return configExists;
};

const camelToUpperSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase();

const generateConfigKeyInProcessEnv = (configKey: keyof ConfigData) => {
  const keyInSnakeCase = camelToUpperSnakeCase(configKey);
  const configKeyInProcessEnv = `${CONFIG_PROCESS_ENV_DOMAIN}_${keyInSnakeCase}`;
  return configKeyInProcessEnv;
};

const setConfigDataInProcessEnv = (data: ConfigData) => {
  for (const [key, value] of Object.entries(data)) {
    const configKeyInProcessEnv = generateConfigKeyInProcessEnv(key as keyof ConfigData);
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

export const ConfigService = {
  checkConfigExists,

  getConfigDataByKey(key: keyof ConfigData): string {
    const configKeyInProcessEnv = generateConfigKeyInProcessEnv(key);
    return process.env[configKeyInProcessEnv] as string;
  },

  loadConfigToProcessEnv(directoryPath: string, fileName = CONFIG_NAME) {
    const data = readConfig(directoryPath, fileName);
    setConfigDataInProcessEnv(data);

    return data;
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
        const mergedData: ConfigData = { ...configDataToOverride, ...data };
        writeConfig(mergedData, directoryPath, fileName);
      }

      if (options.setInProcessEnv) setConfigDataInProcessEnv(data);

      return data;
    } catch (error) {
      Logger.debug('An error has occurred while creating mcode config file', (error as Error).message);
    }
  },
};
