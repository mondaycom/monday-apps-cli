import AppList from 'commands/app/list';
import { getStdout, mockRequestResolvedValueOnce } from 'test/cli-test-utils';

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
    await AppList.run();

    // requires investigation - This should work with getStderr
    const stdout = getStdout();
    expect(stdout).toContain('app1');
    expect(stdout).toContain('app2');
  });

  it('should print message if no apps', async () => {
    mockRequestResolvedValueOnce({ apps: [] });
    await AppList.run();
    const stdout = getStdout();
    expect(stdout).toContain('No apps found');
  });
});
