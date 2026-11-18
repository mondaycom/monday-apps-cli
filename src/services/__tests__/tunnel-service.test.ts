// eslint-disable-next-line node/no-extraneous-import,n/no-extraneous-import
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  NGROK_BLOCKED_BY_OS_MESSAGE,
  NGROK_LOAD_FAILED_MESSAGE,
  createTunnelConnection,
} from 'services/tunnel-service';
import { TunnelCommandTasksContext } from 'types/commands/tunnel';

let mockNgrokLoadError: Error | undefined;
const mockTunnel = { url: () => 'https://my-app.apps-tunnel.monday.app' };

// Fake ngrok: either fails to load (e.g. blocked by Windows Smart App Control) or opens mockTunnel.
jest.mock('@ngrok/ngrok', () => {
  if (mockNgrokLoadError) {
    throw mockNgrokLoadError;
  }

  const endpoint = { domain: () => endpoint, forwardsTo: () => endpoint, listen: async () => mockTunnel };
  return {
    SessionBuilder: class {
      authtoken() {
        return this;
      }

      async connect() {
        return { httpEndpoint: () => endpoint };
      }
    },
  };
});

const tunnelCtx = (): TunnelCommandTasksContext => ({
  appId: 1,
  tunnelPort: 8080,
  authToken: 'token',
  tunnelDomain: 'my-app.apps-tunnel.monday.app',
});

describe('createTunnelConnection', () => {
  beforeEach(() => {
    // Re-evaluate the ngrok mock factory on every test, so a load failure in one test doesn't leak into another.
    jest.resetModules();
    mockNgrokLoadError = undefined;
  });

  it('opens the tunnel when ngrok loads', async () => {
    const ctx = tunnelCtx();

    await createTunnelConnection(ctx);

    expect(ctx.tunnel).toBe(mockTunnel);
    expect(ctx.forwardingAddress).toBe('http://localhost:8080');
  });

  it('reports an OS policy block and keeps the original error', async () => {
    mockNgrokLoadError = Object.assign(new Error('An Application Control policy has blocked this file.'), {
      code: 'ERR_DLOPEN_FAILED',
    });

    const result = createTunnelConnection(tunnelCtx());

    await expect(result).rejects.toThrow(NGROK_BLOCKED_BY_OS_MESSAGE);
    await expect(result).rejects.toThrow('An Application Control policy has blocked this file.');
    await expect(result).rejects.toHaveProperty('cause', mockNgrokLoadError);
  });

  it('reports a generic load failure and keeps the original error', async () => {
    mockNgrokLoadError = new Error('Cannot find module @ngrok/ngrok-linux-x64-gnu');

    const result = createTunnelConnection(tunnelCtx());

    await expect(result).rejects.toThrow(NGROK_LOAD_FAILED_MESSAGE);
    await expect(result).rejects.toThrow('Cannot find module @ngrok/ngrok-linux-x64-gnu');
    await expect(result).rejects.not.toThrow(NGROK_BLOCKED_BY_OS_MESSAGE);
    await expect(result).rejects.toHaveProperty('cause', mockNgrokLoadError);
  });
});
