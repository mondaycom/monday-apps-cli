import { Command } from '@oclif/core';

import { ConfigService } from 'services/config-service';
import { getAppsDomain, getCurrentWorkingDirectory, initCurrentWorkingDirectory } from 'services/env-service';
import { enablePrintCommand } from 'utils/command-printer';
import logger, { enableDebugMode } from 'utils/logger';

const parseArgValue = (argv: string[], flag: string): string | undefined => {
  const full = argv.find(arg => arg.startsWith(`${flag}=`));
  if (full) return full.slice(flag.length + 1);
  const idx = argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < argv.length) return argv[idx + 1];
  return undefined;
};

export default function init(opts: Command) {
  initCurrentWorkingDirectory();

  const globalConfigDir = opts.config.configDir;
  const isLocalConfig = ConfigService.checkLocalConfigExists();
  if (isLocalConfig) {
    opts.config.configDir = getCurrentWorkingDirectory();

    // Warn if a local .mappsrc contains profiles — profiles execute arbitrary commands
    // and should only be configured in the global config to prevent malicious repos
    // from running attacker-controlled shell commands.
    const localData = ConfigService.readConfigData(opts.config.configDir);
    if (localData?.profiles) {
      logger.warn('Ignoring profiles in local .mappsrc — profiles are only loaded from global config for security.');
    }
  }

  const commandId = opts.id;
  const skipProfiles = !commandId || commandId === 'init' || commandId.startsWith('profile');
  const profileName = parseArgValue(opts.argv, '--profile');
  const ignoreProfiles = skipProfiles || opts.argv.includes('--ignore-profiles');

  // Load access token from whichever config dir was resolved (local or global)
  ConfigService.loadConfigToProcessEnv(opts.config.configDir, undefined, undefined, true);

  // Resolve profiles only from the global config — never from local project configs
  if (!ignoreProfiles) {
    ConfigService.resolveAndSetProfile(globalConfigDir, profileName);
  }
  if (opts.argv.includes('--verbose')) {
    enableDebugMode();
    logger.debug(`* Domain: ${getAppsDomain()} *`);
  }

  if (opts.argv.includes('--print-command') || opts.argv.includes('--pc')) {
    enablePrintCommand();
  }
}
