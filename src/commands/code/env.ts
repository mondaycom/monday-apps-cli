import { Flags } from '@oclif/core';
import { Relationship } from '@oclif/core/lib/interfaces/parser';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_ENV_MANAGEMENT_MODES } from 'consts/manage-app-env';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { handleEnvironmentRequest } from 'services/manage-app-env-service';
import { PromptService } from 'services/prompt-service';
import { ManageAppEnvFlags } from 'types/commands/manage-app-env';
import logger from 'utils/logger';

const MODES_WITH_KEYS: Array<APP_ENV_MANAGEMENT_MODES> = [
  APP_ENV_MANAGEMENT_MODES.SET,
  APP_ENV_MANAGEMENT_MODES.DELETE,
];

const isKeyRequired = (mode: APP_ENV_MANAGEMENT_MODES) => MODES_WITH_KEYS.includes(mode);
const isValueRequired = (mode: APP_ENV_MANAGEMENT_MODES) => mode === APP_ENV_MANAGEMENT_MODES.SET;

const promptForModeIfNotProvided = async (mode?: APP_ENV_MANAGEMENT_MODES) => {
  if (!mode) {
    mode = await PromptService.promptSelectionWithAutoComplete<APP_ENV_MANAGEMENT_MODES>(
      'Select app environment variables management mode',
      Object.values(APP_ENV_MANAGEMENT_MODES),
    );
  }

  return mode;
};

const promptForKeyIfNotProvided = async (mode: APP_ENV_MANAGEMENT_MODES, key?: string) => {
  if (!key && isKeyRequired(mode)) {
    key = await PromptService.promptInput('Enter key for environment variable');
  }

  return key;
};

const promptForValueIfNotProvided = async (mode: APP_ENV_MANAGEMENT_MODES, value?: string) => {
  if (!value && isValueRequired(mode)) {
    value = await PromptService.promptForHiddenInput(
      'value',
      'Enter value for environment variable',
      'You must enter a value value',
    );
  }

  return value;
};

const flagsWithModeRelationships: Relationship = {
  type: 'all',
  flags: [
    {
      name: 'mode',
      // eslint-disable-next-line @typescript-eslint/require-await
      when: async (flags: Record<string, unknown>) => isValueRequired(flags.mode as (typeof MODES_WITH_KEYS)[number]),
    },
  ],
};

export default class Env extends AuthenticatedCommand {
  static description = 'Manage environment variables for your app hosted on monday-code.';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = Env.serializeFlags({
    appId: Flags.integer({
      char: 'i',
      description: 'The id of the app to manage environment variables for',
    }),
    mode: Flags.string({
      char: 'm',
      description: 'management mode',
      options: Object.values(APP_ENV_MANAGEMENT_MODES),
    }),
    key: Flags.string({
      char: 'k',
      description: 'variable key [required for set and delete]]',
      relationships: [flagsWithModeRelationships],
    }),
    value: Flags.string({
      char: 'v',
      description: 'variable value [required for set]',
      relationships: [flagsWithModeRelationships],
    }),
  });

  static args = {};

  public async run(): Promise<void> {
    const { flags } = await this.parse(Env);
    let { mode, key, value, appId } = flags as ManageAppEnvFlags;

    if (!appId) {
      appId = Number(await DynamicChoicesService.chooseApp());
    }

    mode = await promptForModeIfNotProvided(mode);
    key = await promptForKeyIfNotProvided(mode, key);
    value = await promptForValueIfNotProvided(mode, value);

    try {
      await handleEnvironmentRequest(appId, mode, key, value);
    } catch (error: any) {
      logger.error((error as Error).message);
      this.exit(1);
    }
  }
}