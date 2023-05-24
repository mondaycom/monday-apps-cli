import { Command } from '@oclif/core';

import { ConfigService } from 'services/config-service';
import { getAppsDomain, initCurrentWorkingDirectory } from 'services/env-service';
import logger, { enableDebugMode } from 'utils/logger';

export default function init(opts: Command) {
  ConfigService.loadConfigToProcessEnv(opts.config.configDir);
  if (opts.argv.includes('--verbose')) {
    enableDebugMode();
    logger.debug(`* Domain: ${getAppsDomain()} *`);
  }

  initCurrentWorkingDirectory();
}
