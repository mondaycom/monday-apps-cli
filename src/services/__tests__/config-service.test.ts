import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// eslint-disable-next-line node/no-extraneous-import,n/no-extraneous-import
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

import { CONFIG_NAME, ConfigService } from 'services/config-service';

describe('ConfigService', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `mapps-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up env vars
    delete process.env.MONDAY_CODE_ACCESS_TOKEN;

    // Clean up temp dir
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('loadConfigToProcessEnv', () => {
    it('should load config file values into process.env', () => {
      const configData = { accessToken: 'file-token' };
      writeFileSync(join(testDir, CONFIG_NAME), JSON.stringify(configData), 'utf8');

      ConfigService.loadConfigToProcessEnv(testDir);

      expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('file-token');
    });

    it('should not overwrite a pre-existing env var with the config file value', () => {
      process.env.MONDAY_CODE_ACCESS_TOKEN = 'env-token';

      const configData = { accessToken: 'file-token' };
      writeFileSync(join(testDir, CONFIG_NAME), JSON.stringify(configData), 'utf8');

      ConfigService.loadConfigToProcessEnv(testDir);

      expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('env-token');
    });
  });

  describe('init', () => {
    it('should force-set env var even if one already exists when setInProcessEnv is true', () => {
      process.env.MONDAY_CODE_ACCESS_TOKEN = 'old-token';

      ConfigService.init({ accessToken: 'new-init-token' }, testDir, { setInProcessEnv: true });

      expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('new-init-token');
    });
  });
});
