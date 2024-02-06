import AppCreate from 'commands/app/create';
import { buildMockFlags, getStdout, mockRequestResolvedValueOnce } from 'test/cli-test-utils';

describe('app:create', () => {
  const mockAppCreateResponse = {
    app: {
      id: 1_000_000_001,
      name: 'New App by CLI',
      state: 'active',
      kind: 'private',
    },
  };

  it('should create app successfully', async () => {
    const mockPushFlags = buildMockFlags(AppCreate, { name: 'New App by CLI' });
    mockRequestResolvedValueOnce(mockAppCreateResponse);
    await AppCreate.run(mockPushFlags);
    const stdout = getStdout();
    expect(stdout).toContain('App created successfully: New App by CLI (id: 1000000001)');
  });
});
