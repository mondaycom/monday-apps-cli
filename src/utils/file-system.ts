import { promises as fs } from 'node:fs';

import logger from 'utils/logger';

export class FSError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}
export const saveToFile = async (filePath: string, content: string) => {
  try {
    await fs.writeFile(filePath, content, 'utf8');
  } catch (error) {
    logger.debug(error);
    throw new FSError(`Failed to save file, please check if this file path "${filePath}" is correct.`);
  }
};

export const loadFile = (filePath: string) => {
  try {
    return fs.readFile(filePath, 'utf8');
  } catch (error) {
    logger.debug(error);
    throw new FSError(`Failed to load file, please check if this file path "${filePath}" is correct.`);
  }
};
