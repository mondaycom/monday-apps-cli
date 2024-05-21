import { Config } from '@oclif/core';

import { BaseCommand } from 'commands-base/base-command';
import { CONFIG_KEYS } from 'consts/config';
import { ACCESS_TOKEN_NOT_FOUND_RUNNING_INIT } from 'consts/messages';
import { AuthenticationError } from 'errors/authentication-error';
import { ConfigService } from 'services/config-service';
import logger from 'utils/logger';

const validateAccessToken = async (config: Config): Promise<void> => {
  const accessToken = ConfigService.getConfigDataByKey(CONFIG_KEYS.ACCESS_TOKEN);
  if (!accessToken) {
    logger.success(ACCESS_TOKEN_NOT_FOUND_RUNNING_INIT);
    await config.runCommand('init', ['--local']);
  }
};

export abstract class AuthenticatedCommand extends BaseCommand {
  public async init(): Promise<void> {
    await super.init();
    await validateAccessToken(this.config);
  }

  protected catch(err: Error & { exitCode?: number }): any {
    if (err instanceof AuthenticationError) {
      logger.error(err);
      return process.exit(1);
    }

    return super.catch(err);
  }

  protected async finally(_: Error | undefined): Promise<any> {
    return super.finally(_);
  }
}
