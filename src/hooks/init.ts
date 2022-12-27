import { ConfigService } from '../services/config-service.js';
import { Command } from '@oclif/core';
import { enableDebugMode } from '../utils/logger.js';

export default function init(opts: Command) {
  ConfigService.loadConfigToProcessEnv(opts.config.configDir);
  if (opts.argv.includes('--verbose') || opts.argv.includes('-d')) {
    enableDebugMode();
  }
}
