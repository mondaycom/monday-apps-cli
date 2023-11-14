import * as ngrok from '@ngrok/ngrok';
import { ListrTaskWrapper } from 'listr2';

import { generateTunnelingTokenUrl } from 'consts/urls';
import { execute } from 'services/api-service';
import { tunnelAuthTokenSchema } from 'services/schemas/push-service-schemas';
import { TunnelCommandTasksContext } from 'types/commands/tunnel';
import { HttpError } from 'types/errors';
import { HttpMethodTypes } from 'types/services/api-service';
import { TunnelAuthToken } from 'types/services/push-service';
import logger from 'utils/logger';
import { appsUrlBuilder } from 'utils/urls-builder';

export const generateTunnelingAuthToken = async (
  ctx: TunnelCommandTasksContext,
  task: ListrTaskWrapper<TunnelCommandTasksContext, any>,
) => {
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

    task.output = `Creating a tunnel from "${ctx.tunnelDomain}" to "http://localhost:${ctx.tunnelPort}"`; // FIXME: not working

    return {
      token: response.token,
      domain: response.domain,
    };
  } catch (error: any | HttpError) {
    logger.debug(error, DEBUG_TAG);
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('Failed to build remote location for upload.');
  }

  // return mockImpl(ctx, task); // FIXME: remove
};

export const createTunnelConnection = async (
  ctx: TunnelCommandTasksContext,
  task: ListrTaskWrapper<TunnelCommandTasksContext, any>,
) => {
  // FIXME: maor: remove all logs and redundant code
  // FIXME: maor: add logger
  const DEBUG_TAG = 'create_tunnel_connection';

  try {
    const forwardingAddress = `http://localhost:${ctx.tunnelPort}`;
    const session = await new ngrok.SessionBuilder().authtoken(String(ctx.authToken)).connect();
    const tunnel = await session.httpEndpoint().domain(String(ctx.tunnelDomain)).forwardsTo(forwardingAddress).listen();
    const logs = [
      `Ingress established at: ${String(tunnel.url())}`,
      `forwarding traffic to: ${forwardingAddress}`,
      `Terminate this process to close the tunnel connection`,
    ];
    task.output = logs.join('\n');
    await tunnel.forward(forwardingAddress);
  } catch (error) {
    // TODO: what to expose to the user? the error comes from ngrok
    console.log('Error setting up tunnel:', error);
    // TODO: maor: handle error, proccess.exit?
  }
};
