import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { ConfigService, CONFIG_NAME } from 'services/config-service';

describe('ConfigService', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `mapps-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    delete process.env.MONDAY_CODE_ACCESS_TOKEN;
    delete process.env.MONDAY_CODE_TOKEN_COMMAND;
    delete process.env.MONDAY_CODE_DEFAULT_TOKEN_NAME;

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

    it('should use accessToken from config when no tokenCommand is set', () => {
      const configData = { accessToken: 'plain-token' };
      writeFileSync(join(testDir, CONFIG_NAME), JSON.stringify(configData), 'utf8');

      ConfigService.loadConfigToProcessEnv(testDir);

      expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('plain-token');
    });
  });

  describe('tokenCommand resolution', () => {
    it('should resolve tokenCommand and set accessToken from its output', () => {
      const configData = { tokenCommand: 'echo resolved-token' };
      writeFileSync(join(testDir, CONFIG_NAME), JSON.stringify(configData), 'utf8');

      ConfigService.loadConfigToProcessEnv(testDir);

      expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('resolved-token');
    });

    it('should substitute {{name}} with defaultTokenName', () => {
      const configData = {
        tokenCommand: 'echo token-for-{{name}}',
        defaultTokenName: 'my-dev-account',
      };
      writeFileSync(join(testDir, CONFIG_NAME), JSON.stringify(configData), 'utf8');

      ConfigService.loadConfigToProcessEnv(testDir);

      expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('token-for-my-dev-account');
    });

    it('should substitute {{name}} with explicit tokenName override', () => {
      const configData = {
        tokenCommand: 'echo token-for-{{name}}',
        defaultTokenName: 'dev',
      };
      writeFileSync(join(testDir, CONFIG_NAME), JSON.stringify(configData), 'utf8');

      ConfigService.loadConfigToProcessEnv(testDir, CONFIG_NAME, 'prod');

      expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('token-for-prod');
    });

    it('should exit with error when tokenCommand fails', () => {
      const configData = {
        tokenCommand: 'false',
        accessToken: 'fallback-token',
      };
      writeFileSync(join(testDir, CONFIG_NAME), JSON.stringify(configData), 'utf8');

      expect(() => ConfigService.loadConfigToProcessEnv(testDir)).toThrow('process.exit(1)');
    });

    it('should exit with error when {{name}} is in tokenCommand but no name is provided', () => {
      const configData = {
        tokenCommand: 'echo token-for-{{name}}',
      };
      writeFileSync(join(testDir, CONFIG_NAME), JSON.stringify(configData), 'utf8');

      expect(() => ConfigService.loadConfigToProcessEnv(testDir)).toThrow('process.exit(1)');
    });

    it('should skip tokenCommand when ignoreTokenCommand is true', () => {
      const configData = {
        tokenCommand: 'false',
        accessToken: 'fallback-token',
      };
      writeFileSync(join(testDir, CONFIG_NAME), JSON.stringify(configData), 'utf8');

      ConfigService.loadConfigToProcessEnv(testDir, CONFIG_NAME, undefined, true);

      expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('fallback-token');
    });
  });

  describe('resolveAndSetToken', () => {
    it('should re-resolve tokenCommand with a new token name', () => {
      process.env.MONDAY_CODE_TOKEN_COMMAND = 'echo token-for-{{name}}';
      process.env.MONDAY_CODE_DEFAULT_TOKEN_NAME = 'dev';

      ConfigService.resolveAndSetToken('staging');

      expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('token-for-staging');
    });

    it('should do nothing when no tokenCommand is set', () => {
      process.env.MONDAY_CODE_ACCESS_TOKEN = 'existing-token';

      ConfigService.resolveAndSetToken('anything');

      expect(process.env.MONDAY_CODE_ACCESS_TOKEN).toBe('existing-token');
    });
  });

  describe('init', () => {
    it('should write tokenCommand to config file', () => {
      ConfigService.init(
        { tokenCommand: 'echo my-token', defaultTokenName: 'dev' },
        testDir,
        { setInProcessEnv: true },
      );

      expect(process.env.MONDAY_CODE_TOKEN_COMMAND).toBe('echo my-token');
      expect(process.env.MONDAY_CODE_DEFAULT_TOKEN_NAME).toBe('dev');
    });
  });
});
