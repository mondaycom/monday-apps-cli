// import { Conf } from '@oclif/core';
import { ConfigService } from '../services/config-service.js';
import { Command } from '@oclif/core';

export default function init(opts: Command) {
  ConfigService.loadConfigToProcessEnv(opts.config.configDir);
}
