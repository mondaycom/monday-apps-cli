import { BaseCommand } from 'commands-base/base-command';
import { ConfigService } from 'services/config-service';
import { ConfigData } from 'types/services/config-service';

// Profiles are only managed in the global config for security — profile commands
// execute arbitrary shell code, so they must not be loadable from local project
// configs where a malicious repo could inject attacker-controlled commands.
export abstract class BaseProfileCommand extends BaseCommand {
  static withPrintCommand = false;
  forcefullyExitAfterRun = false;

  protected getExistingConfig(): ConfigData {
    return ConfigService.readConfigData(this.config.configDir) ?? {};
  }

  protected saveConfig(data: ConfigData): void {
    ConfigService.writeConfigData(data, this.config.configDir);
  }
}
