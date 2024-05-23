import { Flags } from '@oclif/core';
import { Relationship } from '@oclif/core/lib/interfaces/parser';

import { addRegionToFlags, chooseRegionIfNeeded } from 'commands/utils/region';
import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_ENV_MANAGEMENT_MODES } from 'consts/manage-app-env';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { handleEnvironmentRequest, listAppEnvKeys } from 'services/manage-app-env-service';
import { PromptService } from 'services/prompt-service';
import { ManageAppEnvFlags } from 'types/commands/manage-app-env';
import { AppId } from 'types/general';
import logger from 'utils/logger';
import { getRegionFromString } from 'utils/region';

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

const promptForKeyIfNotProvided = async (mode: APP_ENV_MANAGEMENT_MODES, appId: AppId, key?: string) => {
  if (!key && isKeyRequired(mode)) {
    const existingKeys = await listAppEnvKeys(appId);
    key = await PromptService.promptSelectionWithAutoComplete('Enter key for environment variable', existingKeys, {
      includeInputInSelection: true,
    });
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

      when: async (flags: Record<string, unknown>) => isValueRequired(flags.mode as (typeof MODES_WITH_KEYS)[number]),
    },
  ],
};

export default class Env extends AuthenticatedCommand {
  static description = 'Manage environment variables for your app hosted on monday-code.';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = Env.serializeFlags(
    addRegionToFlags({
      appId: Flags.integer({
        char: 'i',
        aliases: ['a'],
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
    }),
  );

  static args = {};
  DEBUG_TAG = 'env';
  public async run(): Promise<void> {
    try {
      const { flags } = await this.parse(Env);
      const { region: strRegion } = flags;
      const region = getRegionFromString(strRegion);
      let { mode, key, value, appId } = flags as ManageAppEnvFlags;

      if (!appId) {
        appId = Number(await DynamicChoicesService.chooseApp());
      }

      const selectedRegion = await chooseRegionIfNeeded(region, { appId });

      mode = await promptForModeIfNotProvided(mode);
      key = await promptForKeyIfNotProvided(mode, appId, key);
      value = await promptForValueIfNotProvided(mode, value);
      this.preparePrintCommand(this, { appId, mode, key, value, region: selectedRegion });

      await handleEnvironmentRequest(appId, mode, key, value, selectedRegion);
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);

      // need to signal to the parent process that the command failed
      process.exit(1);
    }
  }
}
