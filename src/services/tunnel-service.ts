import { ListrTaskWrapper } from 'listr2';

import { generateTunnelingTokenUrl, getTunnelingDomainUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { tunnelAuthTokenSchema, tunnelDomainSchema } from 'services/schemas/push-service-schemas';
import { TunnelCommandTasksContext } from 'types/commands/tunnel';
import { HttpError } from 'types/errors';
import { AppId } from 'types/general';
import { HttpMethodTypes } from 'types/services/api-service';
import { TunnelAuthToken, TunnelDomain } from 'types/services/tunnel-service';
import logger from 'utils/logger';
import { appsUrlBuilder } from 'utils/urls-builder';

export const NGROK_BLOCKED_BY_OS_MESSAGE =
  'Failed to load the ngrok native module required by "tunnel:create": your operating system security policy ' +
  '(e.g. Windows Smart App Control) blocked it. Run the tunnel from WSL2 or Docker, or allow the blocked file. ' +
  'Other mapps commands are not affected.';
export const NGROK_LOAD_FAILED_MESSAGE = 'Failed to load the ngrok module required for tunneling.';

const isBlockedByOsPolicy = (error: unknown): boolean =>
  error instanceof Error &&
  ((error as NodeJS.ErrnoException).code === 'ERR_DLOPEN_FAILED' || /application control policy/i.test(error.message));

// @ngrok/ngrok ships an unsigned native addon, which OS policies (e.g. Windows Smart App Control) may block.
// Load it lazily so only the tunnel command depends on it, instead of every command that imports this service.
const loadNgrok = async () => {
  try {
    return await import('@ngrok/ngrok');
  } catch (error: unknown) {
    logger.debug(error, 'load_ngrok');
    const message = isBlockedByOsPolicy(error) ? NGROK_BLOCKED_BY_OS_MESSAGE : NGROK_LOAD_FAILED_MESSAGE;
    const originalMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`${message}\nOriginal error: ${originalMessage}`, { cause: error });
  }
};

function handleError(error: any, DEBUG_TAG: string, message: string) {
  logger.debug(error, DEBUG_TAG);
  if (error instanceof HttpError) {
    throw error;
  }

  throw new Error(message);
}

export const generateTunnelingAuthToken = async (ctx: TunnelCommandTasksContext) => {
  const DEBUG_TAG = 'generate_tunneling_auth_token';
  try {
    const baseUrl = generateTunnelingTokenUrl();
    const url = appsUrlBuilder(baseUrl);
    const response = await execute<TunnelAuthToken>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.PUT,
        query: {
          appId: ctx.appId,
        },
      },
      tunnelAuthTokenSchema,
    );

    ctx.authToken = response.token;
    ctx.tunnelDomain = response.domain;

    return {
      token: response.token,
      domain: response.domain,
    };
  } catch (error: any | HttpError) {
    handleError(error, DEBUG_TAG, 'Failed to generate tunneling auth token.');
  }
};

export const getTunnelingDomain = async (appId?: AppId) => {
  const DEBUG_TAG = 'get_tunneling_domain';
  try {
    const baseUrl = getTunnelingDomainUrl();
    const url = appsUrlBuilder(baseUrl);
    const response = await execute<TunnelDomain>(
      {
        url,
        headers: { Accept: 'application/json' },
        method: HttpMethodTypes.GET,
        query: {
          appId,
        },
      },
      tunnelDomainSchema,
    );

    return response.domain;
  } catch (error: any | HttpError) {
    handleError(error, DEBUG_TAG, 'Failed to get tunneling domain.');
  }
};

export const createTunnelConnection = async (ctx: TunnelCommandTasksContext) => {
  const DEBUG_TAG = 'create_tunnel_connection';
  // Loaded outside the try block so its descriptive error is not replaced by the generic one in handleError.
  const ngrok = await loadNgrok();

  try {
    const forwardingAddress = `http://localhost:${ctx.tunnelPort}`;
    logger.debug(`forwarding address: ${forwardingAddress}`, DEBUG_TAG);
    const session = await new ngrok.SessionBuilder().authtoken(String(ctx.authToken)).connect();
    logger.debug(`session created`, DEBUG_TAG);
    const tunnel = await session.httpEndpoint().domain(String(ctx.tunnelDomain)).forwardsTo(forwardingAddress).listen();
    logger.debug(`tunnel created`, DEBUG_TAG);

    ctx.forwardingAddress = forwardingAddress;
    ctx.tunnel = tunnel;
  } catch (error: any | HttpError) {
    handleError(error, DEBUG_TAG, 'Failed to create tunnel connection.');
  }
};

export const connectTunnel = async (
  ctx: TunnelCommandTasksContext,
  task: ListrTaskWrapper<TunnelCommandTasksContext, any>,
) => {
  const DEBUG_TAG = 'connect_tunnel';
  const forwardingAddress = ctx.forwardingAddress!;
  const tunnel = ctx.tunnel!;

  try {
    task.output = `Connection established at: ${String(tunnel.url())} --> forwarding traffic to: ${forwardingAddress}
      \nTerminate this process to close the tunnel connection`;
    await tunnel.forward(forwardingAddress); // actually opens the tunnel, and will "hang" open until terminated
  } catch (error: any | HttpError) {
    handleError(error, DEBUG_TAG, 'Failed to establish tunnel connection.');
  }
};
