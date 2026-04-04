import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { PromptService } from 'services/prompt-service';
import { createMockConfig, getConfigDataByKeySpy } from 'test/cli-test-utils';

class TestCommand extends AuthenticatedCommand {
  static withPrintCommand = false;
  static flags = {};
  async run() {
    // no-op — we're testing init() lifecycle
  }
}

const writeTempConfig = (dir: string, data: object) => {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, '.mappsrc'), JSON.stringify(data), 'utf8');
};

beforeEach(() => {
  delete process.env.MONDAY_CODE_ACCESS_TOKEN;
});

describe('AuthenticatedCommand first-run auth flow', () => {
  it('resolves profile and sets token after profile:add setup', async () => {
    const dir = join(tmpdir(), `mapps-auth-test-${Date.now()}-${Math.random()}`);
    mkdirSync(dir, { recursive: true });

    const config = createMockConfig();
    config.configDir = dir;

    // Override global mock to simulate no token configured
    getConfigDataByKeySpy.mockReturnValue(undefined as any);

    // Mock the interactive prompt to choose "Credential profile"
    jest.spyOn(PromptService, 'promptList').mockResolvedValueOnce('Credential profile (secrets manager)');

    // Mock runCommand('profile:add') to simulate writing a profile config
    (config.runCommand as jest.Mock).mockImplementation(async (cmd: string) => {
      if (cmd === 'profile:add') {
        writeTempConfig(dir, {
          profiles: { dev: 'echo test-token-from-profile' },
          defaultProfile: 'dev',
        });
      }
    });

    const command = new TestCommand([], config);
    await command.init();

    expect(config.runCommand).toHaveBeenCalledWith('profile:add');
    expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('test-token-from-profile');
  });

  it('sets token after init --local plaintext setup', async () => {
    const dir = join(tmpdir(), `mapps-auth-test-${Date.now()}-${Math.random()}`);
    mkdirSync(dir, { recursive: true });

    const config = createMockConfig();
    config.configDir = dir;

    // Override global mock to simulate no token configured
    getConfigDataByKeySpy.mockReturnValue(undefined as any);

    // Mock the interactive prompt to choose "Access token"
    jest.spyOn(PromptService, 'promptList').mockResolvedValueOnce('Access token (plaintext)');

    // Mock runCommand('init') to simulate writing a plaintext token
    (config.runCommand as jest.Mock).mockImplementation(async (cmd: string) => {
      if (cmd === 'init') {
        writeTempConfig(dir, { accessToken: 'plaintext-token' });
        process.env.MONDAY_CODE_ACCESS_TOKEN = 'plaintext-token';
      }
    });

    const command = new TestCommand([], config);
    await command.init();

    expect(config.runCommand).toHaveBeenCalledWith('init', ['--local']);
    expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('plaintext-token');
  });

  it('skips auth prompt when token already exists', async () => {
    const dir = join(tmpdir(), `mapps-auth-test-${Date.now()}-${Math.random()}`);
    mkdirSync(dir, { recursive: true });
    process.env.MONDAY_CODE_ACCESS_TOKEN = 'existing-token';

    const config = createMockConfig();
    config.configDir = dir;

    const promptSpy = jest.spyOn(PromptService, 'promptList');

    const command = new TestCommand([], config);
    await command.init();

    expect(promptSpy).not.toHaveBeenCalled();
    expect(config.runCommand).not.toHaveBeenCalled();
    expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('existing-token');
  });
});
