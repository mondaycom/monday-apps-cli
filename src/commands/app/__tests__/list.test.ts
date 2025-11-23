import AppList from 'commands/app/list';
import { createMockConfig, getStderr, getStdout, mockRequestResolvedValueOnce } from 'test/cli-test-utils';

describe('app:list', () => {
  const mockAppListResponse = {
    apps: [
      {
        id: 1,
        name: 'app1',
      },
      {
        id: 2,
        name: 'app2',
      },
    ],
  };

  it('should list apps if exists', async () => {
    mockRequestResolvedValueOnce(mockAppListResponse);
    const config = createMockConfig();
    const command = new AppList([], config);

    await command.run();

    // requires investigation - This should work with getStderr
    const stdout = getStdout();
    expect(stdout).toContain('app1');
    expect(stdout).toContain('app2');
  });

  it('should print message if no apps', async () => {
    mockRequestResolvedValueOnce({ apps: [] });
    const config = createMockConfig();
    const command = new AppList([], config);

    await command.run();
    const stderr = getStderr();
    expect(stderr).toContain('No apps found');
  });
});
