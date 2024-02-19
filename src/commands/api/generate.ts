import { spawn } from 'node:child_process';

import { Command } from '@oclif/core';

import logger from 'utils/logger';

export default class ApiGenerate extends Command {
  DEBUG_TAG = 'api:generate';
  // TODO: yarn add @mondaycom/setup-api - when this package is published
  // TODO: bump version and run the prepublish script

  static description = `Prepares your environment for custom queries development.
                        run it from your root directory and it will create all neccesary files and scripts
                        to start working with custom api queries and mutations.`;

  async run() {
    try {
      await this.runSetupApi();
      logger.info('setup-api completed successfully.');
    } catch (error) {
      logger.debug(error, this.DEBUG_TAG);
      logger.error(`setup-api failed, please make sure you run it in your root directory and try again}`);
    }
  }

  runSetupApi() {
    return new Promise<void>((resolve, reject) => {
      const setupApiProcess = spawn('npx', ['setup-api-monday'], { stdio: 'inherit' });

      setupApiProcess.on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(code);
        }
      });

      setupApiProcess.on('error', error => {
        reject(error);
      });
    });
  }
}
