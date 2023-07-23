import { Flags } from '@oclif/core';
import { Relationship } from '@oclif/core/lib/interfaces/parser';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_ID_TO_ENTER } from 'consts/messages';
import { SECRETS_MANAGEMENT_MODES } from 'consts/secrets';
import { deleteSecret, listAppSecretKeys, setSecret } from 'services/code-secrets-service';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { PromptService } from 'services/prompt-service';
import { SecretsFlags } from 'types/commands/secrets';
import { AppId } from 'types/general';
import logger from 'utils/logger';

const MODES_WITH_KEYS: Array<SECRETS_MANAGEMENT_MODES> = [
  SECRETS_MANAGEMENT_MODES.SET,
  SECRETS_MANAGEMENT_MODES.DELETE,
];

const isKeyRequired = (mode: SECRETS_MANAGEMENT_MODES) => MODES_WITH_KEYS.includes(mode);
const isSecretRequired = (mode: SECRETS_MANAGEMENT_MODES) => mode === SECRETS_MANAGEMENT_MODES.SET;

const promptForModeIfNotProvided = async (mode?: SECRETS_MANAGEMENT_MODES) => {
  if (!mode) {
    mode = await PromptService.promptSelectionWithAutoComplete<SECRETS_MANAGEMENT_MODES>(
      'Select secret management mode',
      Object.values(SECRETS_MANAGEMENT_MODES),
    );
  }

  return mode;
};

const promptForKeyIfNotProvided = async (mode: SECRETS_MANAGEMENT_MODES, key?: string) => {
  if (!key && isKeyRequired(mode)) {
    key = await PromptService.promptInput('Enter secret key');
  }

  return key;
};

const promptForSecretIfNotProvided = async (mode: SECRETS_MANAGEMENT_MODES, secret?: string) => {
  if (!secret && isSecretRequired(mode)) {
    secret = await PromptService.promptForHiddenInput('secret', 'Enter secret value', 'You must enter a secret value');
  }

  return secret;
};

const handleSecretRequest = async (appId: AppId, mode: SECRETS_MANAGEMENT_MODES, key?: string, secret?: string) => {
  if (!appId || !mode) {
    logger.error('appId and mode are required');
    throw new Error('appId and mode are required');
  }

  switch (mode) {
    case SECRETS_MANAGEMENT_MODES.SET: {
      if (!key || !secret) {
        logger.error('key and secret are required');
        throw new Error('key and secret are required');
      }

      await setSecret(appId, key, secret);
      logger.info(`Secret connected to key: "${key}", was set`);
      return;
    }

    case SECRETS_MANAGEMENT_MODES.DELETE: {
      if (!key) {
        logger.error('key is required');
        throw new Error('key is required');
      }

      await deleteSecret(appId, key);
      logger.info(`Secret connected to key: "${key}", was deleted`);
      return;
    }

    case SECRETS_MANAGEMENT_MODES.LIST_KEYS: {
      const response = await listAppSecretKeys(appId);
      if (response?.length === 0) {
        logger.info('No secrets found');
        return;
      }

      logger.info('App secret keys:');
      logger.table(response.map(key => ({ keys: key })));
      return;
    }

    default: {
      logger.error('invalid mode');
      throw new Error('invalid mode');
    }
  }
};

const flagsWithModeRelationships: Relationship = {
  type: 'all',
  flags: [
    {
      name: 'mode',
      // eslint-disable-next-line @typescript-eslint/require-await
      when: async (flags: Record<string, unknown>) => isSecretRequired(flags.mode as (typeof MODES_WITH_KEYS)[number]),
    },
  ],
};

export default class CodeSecrets extends AuthenticatedCommand {
  static description = 'Manage secrets for your project hosted on monday-code.';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = CodeSecrets.serializeFlags({
    appId: Flags.integer({
      char: 'i',
      description: APP_ID_TO_ENTER,
    }),
    mode: Flags.string({
      char: 'm',
      description: 'Secret management mode',
      options: Object.values(SECRETS_MANAGEMENT_MODES),
    }),
    key: Flags.string({
      char: 'k',
      description: 'Secret key',
      relationships: [flagsWithModeRelationships],
    }),
    secret: Flags.string({
      char: 's',
      description: 'The secret value',
      relationships: [flagsWithModeRelationships],
    }),
  });

  static args = {};

  public async run(): Promise<void> {
    const { flags } = await this.parse(CodeSecrets);
    let { mode, key, secret, appId } = flags as SecretsFlags;

    if (!appId) {
      appId = Number(await DynamicChoicesService.chooseApp());
    }

    mode = await promptForModeIfNotProvided(mode);
    key = await promptForKeyIfNotProvided(mode, key);
    secret = await promptForSecretIfNotProvided(mode, secret);

    try {
      await handleSecretRequest(appId, mode, key, secret);
    } catch (error: any) {
      logger.error((error as Error).message);
      this.exit(1);
    }
  }
}
