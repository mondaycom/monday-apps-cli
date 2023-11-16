import * as ngrok from '@ngrok/ngrok';
import { ListrTaskWrapper } from 'listr2';

import { generateTunnelingTokenUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { tunnelAuthTokenSchema } from 'services/schemas/push-service-schemas';
import { TunnelCommandTasksContext } from 'types/commands/tunnel';
import { HttpError } from 'types/errors';
import { HttpMethodTypes } from 'types/services/api-service';
import { TunnelAuthToken } from 'types/services/tunnel-service';
import logger from 'utils/logger';
import { appsUrlBuilder } from 'utils/urls-builder';

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

export const createTunnelConnection = async (ctx: TunnelCommandTasksContext) => {
  const DEBUG_TAG = 'create_tunnel_connection';

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
