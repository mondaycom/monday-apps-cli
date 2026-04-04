import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { ConfigService } from 'services/config-service';
import { getStderr } from 'test/cli-test-utils';

const writeTempConfig = (dir: string, data: object) => {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, '.mappsrc'), JSON.stringify(data), 'utf8');
};

beforeEach(() => {
  delete process.env.MONDAY_CODE_ACCESS_TOKEN;
});

describe('ConfigService.loadConfigToProcessEnv', () => {
  it('loads accessToken from config into process.env', () => {
    const dir = join(tmpdir(), `mapps-test-${Date.now()}-${Math.random()}`);
    writeTempConfig(dir, { accessToken: 'static-token' });

    ConfigService.loadConfigToProcessEnv(dir);

    expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('static-token');
  });

  it('does not overwrite a pre-existing env var (env var takes precedence over config file)', () => {
    const dir = join(tmpdir(), `mapps-test-${Date.now()}-${Math.random()}`);
    writeTempConfig(dir, { accessToken: 'from-file' });
    process.env.MONDAY_CODE_ACCESS_TOKEN = 'from-env';

    ConfigService.loadConfigToProcessEnv(dir);

    expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('from-env');
  });

  it('resolves profile using shell command', () => {
    const dir = join(tmpdir(), `mapps-test-${Date.now()}-${Math.random()}`);
    writeTempConfig(dir, {
      profiles: { dev: 'echo resolved-token' },
      defaultProfile: 'dev',
    });

    ConfigService.loadConfigToProcessEnv(dir);

    expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('resolved-token');
  });

  it('resolves profile for explicit profileName override', () => {
    const dir = join(tmpdir(), `mapps-test-${Date.now()}-${Math.random()}`);
    writeTempConfig(dir, {
      profiles: {
        dev: 'echo dev-token',
        prod: 'echo prod-token',
      },
      defaultProfile: 'dev',
    });

    ConfigService.loadConfigToProcessEnv(dir, undefined, 'prod');

    expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('prod-token');
  });

  it('profile token overrides static accessToken from same config', () => {
    const dir = join(tmpdir(), `mapps-test-${Date.now()}-${Math.random()}`);
    writeTempConfig(dir, {
      accessToken: 'static-token',
      profiles: { dev: 'echo dynamic-token' },
      defaultProfile: 'dev',
    });

    ConfigService.loadConfigToProcessEnv(dir);

    expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('dynamic-token');
  });

  it('skips profile resolution when ignoreProfiles is true', () => {
    const dir = join(tmpdir(), `mapps-test-${Date.now()}-${Math.random()}`);
    writeTempConfig(dir, {
      accessToken: 'fallback-token',
      profiles: { dev: 'echo should-not-run' },
      defaultProfile: 'dev',
    });

    ConfigService.loadConfigToProcessEnv(dir, undefined, undefined, true);

    expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('fallback-token');
  });

  it('exits with error when profile is not found', () => {
    const dir = join(tmpdir(), `mapps-test-${Date.now()}-${Math.random()}`);
    writeTempConfig(dir, {
      profiles: { dev: 'echo dev-token' },
      defaultProfile: 'dev',
    });

    expect(() => ConfigService.loadConfigToProcessEnv(dir, undefined, 'nonexistent')).toThrow('process.exit(1)');
    expect(getStderr()).toContain('Profile "nonexistent" not found');
  });

  it('exits with error when profile returns empty output', () => {
    const dir = join(tmpdir(), `mapps-test-${Date.now()}-${Math.random()}`);
    writeTempConfig(dir, {
      profiles: { dev: 'printf ""' },
      defaultProfile: 'dev',
    });

    expect(() => ConfigService.loadConfigToProcessEnv(dir)).toThrow('process.exit(1)');
    expect(getStderr()).toContain('empty token');
  });

  it('exits with error when profile command fails', () => {
    const dir = join(tmpdir(), `mapps-test-${Date.now()}-${Math.random()}`);
    writeTempConfig(dir, {
      profiles: { dev: 'false' },
      defaultProfile: 'dev',
    });

    expect(() => ConfigService.loadConfigToProcessEnv(dir)).toThrow('process.exit(1)');
    expect(getStderr()).toContain('failed');
  });

  it('falls through to static accessToken when no profileName and no defaultProfile', () => {
    const dir = join(tmpdir(), `mapps-test-${Date.now()}-${Math.random()}`);
    writeTempConfig(dir, {
      accessToken: 'static-fallback',
      profiles: { dev: 'echo dev-token' },
    });

    ConfigService.loadConfigToProcessEnv(dir);

    expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('static-fallback');
  });

  it('does not set profiles object as an env var', () => {
    const dir = join(tmpdir(), `mapps-test-${Date.now()}-${Math.random()}`);
    writeTempConfig(dir, {
      accessToken: 'my-token',
      profiles: { dev: 'echo some-token' },
    });

    ConfigService.loadConfigToProcessEnv(dir, undefined, undefined, true);

    expect(process.env.MONDAY_CODE_PROFILES).toBeUndefined();
  });
});

describe('ConfigService.resolveAndSetProfile', () => {
  it('resolves and sets the token for the given profile', () => {
    const dir = join(tmpdir(), `mapps-test-${Date.now()}-${Math.random()}`);
    writeTempConfig(dir, {
      profiles: {
        dev: 'echo dev-token',
        prod: 'echo prod-token',
      },
      defaultProfile: 'dev',
    });

    ConfigService.resolveAndSetProfile(dir, 'prod');

    expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('prod-token');
  });

  it('warns when no profiles are configured', () => {
    const dir = join(tmpdir(), `mapps-test-${Date.now()}-${Math.random()}`);
    writeTempConfig(dir, { accessToken: 'static-token' });

    ConfigService.resolveAndSetProfile(dir, 'dev');

    expect(getStderr()).toContain('--profile was provided');
  });

  it('silently returns when config file does not exist', () => {
    const dir = join(tmpdir(), `mapps-test-nonexistent-${Date.now()}-${Math.random()}`);

    expect(() => ConfigService.resolveAndSetProfile(dir, 'dev')).not.toThrow();
  });
});

describe('ConfigService.init with profiles', () => {
  it('writes profiles to config file', () => {
    const dir = join(tmpdir(), `mapps-test-${Date.now()}-${Math.random()}`);
    mkdirSync(dir, { recursive: true });

    ConfigService.init(
      {
        profiles: { dev: 'echo dev-token' },
        defaultProfile: 'dev',
      },
      dir,
      { override: true },
    );

    const written = JSON.parse(readFileSync(join(dir, '.mappsrc'), 'utf8'));
    expect(written.profiles).toEqual({ dev: 'echo dev-token' });
    expect(written.defaultProfile).toBe('dev');
  });

  it('merges profiles on override without losing existing entries', () => {
    const dir = join(tmpdir(), `mapps-test-${Date.now()}-${Math.random()}`);
    writeTempConfig(dir, {
      profiles: { dev: 'echo dev-token' },
    });

    ConfigService.init({ profiles: { prod: 'echo prod-token' } }, dir, { override: true });

    const written = JSON.parse(readFileSync(join(dir, '.mappsrc'), 'utf8'));
    expect(written.profiles).toEqual({
      dev: 'echo dev-token',
      prod: 'echo prod-token',
    });
  });
});
