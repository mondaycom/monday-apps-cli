import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import ProfileAdd from 'commands/profile/add';
import ProfileRemove from 'commands/profile/remove';
import ProfileList from 'commands/profile/list';
import ProfileSetDefault from 'commands/profile/set-default';
import ProfileClearDefault from 'commands/profile/clear-default';
import ProfileRemoveToken from 'commands/profile/remove-token';
import { createMockConfig, getStderr, getStdout } from 'test/cli-test-utils';

const writeTempConfig = (dir: string, data: object) => {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, '.mappsrc'), JSON.stringify(data), 'utf8');
};

const readTempConfig = (dir: string) => {
  return JSON.parse(readFileSync(join(dir, '.mappsrc'), 'utf8'));
};

const runCommand = async (Command: any, argv: string[], configDir: string) => {
  const config = createMockConfig();
  config.configDir = configDir;
  const command = new Command(argv, config);
  await command.run();
};

describe('profile subcommands', () => {
  let dir: string;

  beforeEach(() => {
    dir = join(tmpdir(), `mapps-profile-test-${Date.now()}-${Math.random()}`);
    mkdirSync(dir, { recursive: true });
  });

  describe('profile:add', () => {
    it('adds a profile to a new config', async () => {
      writeTempConfig(dir, {});

      await runCommand(ProfileAdd, ['--name', 'dev', '--command', 'echo dev-token'], dir);

      const config = readTempConfig(dir);
      expect(config.profiles.dev).toBe('echo dev-token');
    });

    it('adds a profile and sets as default with --set-as-default', async () => {
      writeTempConfig(dir, {});

      await runCommand(ProfileAdd, ['--name', 'dev', '--command', 'echo dev-token', '--set-as-default'], dir);

      const config = readTempConfig(dir);
      expect(config.profiles.dev).toBe('echo dev-token');
      expect(config.defaultProfile).toBe('dev');
    });

    it('does not set default without --set-as-default', async () => {
      writeTempConfig(dir, {});

      await runCommand(ProfileAdd, ['--name', 'dev', '--command', 'echo dev-token'], dir);

      const config = readTempConfig(dir);
      expect(config.defaultProfile).toBeUndefined();
    });

    it('merges with existing profiles', async () => {
      writeTempConfig(dir, {
        profiles: { dev: 'echo dev-token' },
      });

      await runCommand(ProfileAdd, ['--name', 'prod', '--command', 'echo prod-token'], dir);

      const config = readTempConfig(dir);
      expect(config.profiles.dev).toBe('echo dev-token');
      expect(config.profiles.prod).toBe('echo prod-token');
    });
  });

  describe('profile:remove', () => {
    it('removes a profile', async () => {
      writeTempConfig(dir, {
        profiles: { dev: 'echo dev-token', prod: 'echo prod-token' },
      });

      await runCommand(ProfileRemove, ['--name', 'dev'], dir);

      const config = readTempConfig(dir);
      expect(config.profiles.dev).toBeUndefined();
      expect(config.profiles.prod).toBe('echo prod-token');
    });

    it('clears defaultProfile when removing the default', async () => {
      writeTempConfig(dir, {
        profiles: { dev: 'echo dev-token', prod: 'echo prod-token' },
        defaultProfile: 'dev',
      });

      await runCommand(ProfileRemove, ['--name', 'dev'], dir);

      const config = readTempConfig(dir);
      expect(config.defaultProfile).toBeUndefined();
    });

    it('preserves defaultProfile when removing a non-default', async () => {
      writeTempConfig(dir, {
        profiles: { dev: 'echo dev-token', prod: 'echo prod-token' },
        defaultProfile: 'dev',
      });

      await runCommand(ProfileRemove, ['--name', 'prod'], dir);

      const config = readTempConfig(dir);
      expect(config.defaultProfile).toBe('dev');
    });

    it('exits with error when profile does not exist', async () => {
      writeTempConfig(dir, {
        profiles: { dev: 'echo dev-token' },
      });

      await expect(runCommand(ProfileRemove, ['--name', 'nonexistent'], dir)).rejects.toThrow('process.exit(1)');
      expect(getStderr()).toContain('not found');
    });
  });

  describe('profile:remove-token', () => {
    it('removes the plaintext access token', async () => {
      writeTempConfig(dir, {
        accessToken: 'my-secret-token',
        profiles: { dev: 'echo dev-token' },
      });

      await runCommand(ProfileRemoveToken, [], dir);

      const config = readTempConfig(dir);
      expect(config.accessToken).toBeUndefined();
      expect(config.profiles.dev).toBe('echo dev-token');
    });

    it('handles no token gracefully', async () => {
      writeTempConfig(dir, { profiles: { dev: 'echo dev-token' } });

      await runCommand(ProfileRemoveToken, [], dir);

      const stdout = getStdout();
      expect(stdout).toContain('No plaintext access token');
    });
  });

  describe('profile:set-default', () => {
    it('sets the default profile', async () => {
      writeTempConfig(dir, {
        profiles: { dev: 'echo dev-token', prod: 'echo prod-token' },
      });

      await runCommand(ProfileSetDefault, ['--name', 'prod'], dir);

      const config = readTempConfig(dir);
      expect(config.defaultProfile).toBe('prod');
    });

    it('exits with error when profile does not exist', async () => {
      writeTempConfig(dir, {
        profiles: { dev: 'echo dev-token' },
      });

      await expect(runCommand(ProfileSetDefault, ['--name', 'nonexistent'], dir)).rejects.toThrow('process.exit(1)');
      expect(getStderr()).toContain('not found');
    });
  });

  describe('profile:clear-default', () => {
    it('clears the default profile', async () => {
      writeTempConfig(dir, {
        profiles: { dev: 'echo dev-token', prod: 'echo prod-token' },
        defaultProfile: 'dev',
      });

      await runCommand(ProfileClearDefault, [], dir);

      const config = readTempConfig(dir);
      expect(config.defaultProfile).toBeUndefined();
      expect(config.profiles.dev).toBe('echo dev-token');
    });

    it('handles no default gracefully', async () => {
      writeTempConfig(dir, { profiles: { dev: 'echo dev-token' } });

      await runCommand(ProfileClearDefault, [], dir);

      const stdout = getStdout();
      expect(stdout).toContain('No default profile');
    });
  });

  describe('profile:list', () => {
    it('lists configured profiles', async () => {
      writeTempConfig(dir, {
        accessToken: 'my-secret-token',
        profiles: { dev: 'echo dev-token', prod: 'echo prod-token' },
        defaultProfile: 'dev',
      });

      await runCommand(ProfileList, [], dir);

      const stdout = getStdout();
      expect(stdout).toContain('dev (default)');
      expect(stdout).toContain('prod');
      expect(stdout).toContain('echo dev-token');
    });

    it('shows message when no profiles configured', async () => {
      writeTempConfig(dir, {});

      await runCommand(ProfileList, [], dir);

      const stdout = getStdout();
      expect(stdout).toContain('No profiles configured');
    });
  });
});
