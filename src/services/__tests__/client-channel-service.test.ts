// eslint-disable-next-line node/no-extraneous-import,n/no-extraneous-import
import { describe, expect, it } from '@jest/globals';

/**
 * Tests for the pusher-js CJS export compat shim in client-channel-service.
 *
 * pusher-js@8.5.0 changed its webpack build so the CJS export shape became:
 *   module.exports.Pusher = PusherClass   (8.5.0+)
 * instead of the previous:
 *   module.exports = PusherClass          (< 8.5.0)
 *
 * The shim: `(pusherLib as { Pusher?: T }).Pusher ?? pusherLib`
 * must resolve to the constructor in both cases.
 */
describe('Pusher import compat shim', () => {
  it('resolves to the constructor when pusher-js exports it directly (< 8.5.0)', () => {
    class FakePusher {}

    type PusherConstructor = typeof FakePusher;
    const pusherLib = FakePusher as unknown as PusherConstructor;
    const Pusher = (pusherLib as unknown as { Pusher?: PusherConstructor }).Pusher ?? pusherLib;

    expect(Pusher).toBe(FakePusher);
    expect(new Pusher()).toBeInstanceOf(FakePusher);
  });

  it('resolves to the constructor when pusher-js wraps it in an object (>= 8.5.0)', () => {
    class FakePusher {}

    type PusherConstructor = typeof FakePusher;
    const pusherLib = { Pusher: FakePusher } as unknown as PusherConstructor;
    const Pusher = (pusherLib as unknown as { Pusher?: PusherConstructor }).Pusher ?? pusherLib;

    expect(Pusher).toBe(FakePusher);
    expect(new Pusher()).toBeInstanceOf(FakePusher);
  });
});
