import { Command } from '@oclif/core';

import { ConfigService } from 'services/config-service';
import { getAppsDomain, getCurrentWorkingDirectory, initCurrentWorkingDirectory } from 'services/env-service';
import { enablePrintCommand } from 'utils/command-printer';
import logger, { enableDebugMode } from 'utils/logger';

export default function init(opts: Command) {
  initCurrentWorkingDirectory();
  if (ConfigService.checkLocalConfigExists()) opts.config.configDir = getCurrentWorkingDirectory();
  ConfigService.loadConfigToProcessEnv(opts.config.configDir);
  if (opts.argv.includes('--verbose')) {
    enableDebugMode();
    logger.debug(`* Domain: ${getAppsDomain()} *`);
  }

  if (opts.argv.includes('--print-command') || opts.argv.includes('--pc')) {
    enablePrintCommand();
  }
}
