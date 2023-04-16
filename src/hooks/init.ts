import { Command } from '@oclif/core';
import { ConfigService } from '../services/config-service.js';
import { geMondayCodeDomain, initCurrentWorkingDirectory } from '../services/env-service.js';
import Logger, { enableDebugMode } from '../utils/logger.js';

export default function init(opts: Command) {
  ConfigService.loadConfigToProcessEnv(opts.config.configDir);
  if (opts.argv.includes('--verbose')) {
    enableDebugMode();
    Logger.debug(`* Domain: ${geMondayCodeDomain()} *`);
  }

  initCurrentWorkingDirectory();
}
