import { spawn } from 'node:child_process';

import { Command } from '@oclif/core';

import logger from 'utils/logger';

export default class ApiGenerate extends Command {
  // TODO: yarn add @mondaycom/setup-api - when this package is published
  static description = 'Run the setup-api-monday command from @mondaycom/setup-api';

  async run() {
    const setupApiProcess = spawn('npx', ['setup-api-monday'], { stdio: 'inherit' });

    setupApiProcess.on('close', code => {
      if (code === 0) {
        logger.info('setup-api completed successfully.');
      } else {
        logger.error(`setup-api process exited with an error. Exit code: ${code}`);
      }
    });
  }
}
