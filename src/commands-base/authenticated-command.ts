import { BaseCommand } from 'commands-base/base-command';
import { CONFIG_KEYS } from 'consts/config';
import { ACCESS_TOKEN_NOT_FOUND } from 'consts/messages';
import { AuthenticationError } from 'errors/authentication-error';
import { ConfigService } from 'services/config-service';
import logger from 'utils/logger';

const validateAccessToken = (): void => {
  const accessToken = ConfigService.getConfigDataByKey(CONFIG_KEYS.ACCESS_TOKEN);
  if (!accessToken) {
    throw new AuthenticationError(ACCESS_TOKEN_NOT_FOUND);
  }
};

export abstract class AuthenticatedCommand extends BaseCommand {
  public async init(): Promise<void> {
    await super.init();
    validateAccessToken();
  }

  protected async catch(err: Error & { exitCode?: number }): Promise<any> {
    if (err instanceof AuthenticationError) {
      logger.error(err.message);
      return this.exit(1);
    }

    return super.catch(err);
  }

  protected async finally(_: Error | undefined): Promise<any> {
    return super.finally(_);
  }
}
