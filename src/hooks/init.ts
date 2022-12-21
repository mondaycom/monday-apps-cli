// import { Conf } from '@oclif/core';
import { ConfigService } from '../services/config-service.js';

export default function init(opts: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
    ConfigService.loadConfigToProcessEnv(opts.config.configDir)
}
