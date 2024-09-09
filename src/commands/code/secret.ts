import { Flags } from '@oclif/core';
import { Relationship } from '@oclif/core/lib/interfaces/parser';

import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { APP_SECRET_MANAGEMENT_MODES } from 'consts/manage-app-secret';
import { DynamicChoicesService } from 'services/dynamic-choices-service';
import { handleSecretRequest, listAppSecretKeys } from 'services/manage-app-secret-service';
import { PromptService } from 'services/prompt-service';
import { ManageAppSecretFlags } from 'types/commands/manage-app-secret';
import { AppId } from 'types/general';
import { Region } from 'types/general/region';
import logger from 'utils/logger';
import { addRegionToFlags, chooseRegionIfNeeded, getRegionFromString } from 'utils/region';

const MODES_WITH_KEYS: Array<APP_SECRET_MANAGEMENT_MODES> = [
  APP_SECRET_MANAGEMENT_MODES.SET,
  APP_SECRET_MANAGEMENT_MODES.DELETE,
];

const isKeyRequired = (mode: APP_SECRET_MANAGEMENT_MODES) => MODES_WITH_KEYS.includes(mode);
const isValueRequired = (mode: APP_SECRET_MANAGEMENT_MODES) => mode === APP_SECRET_MANAGEMENT_MODES.SET;

const promptForModeIfNotProvided = async (mode?: APP_SECRET_MANAGEMENT_MODES) => {
  if (!mode) {
    mode = await PromptService.promptSelectionWithAutoComplete<APP_SECRET_MANAGEMENT_MODES>(
      'Select app secret variables management mode',
      Object.values(APP_SECRET_MANAGEMENT_MODES),
    );
  }

  return mode;
};

const promptForKeyIfNotProvided = async (
  mode: APP_SECRET_MANAGEMENT_MODES,
  appId: AppId,
  key?: string,
  region?: Region,
) => {
  if (!key && isKeyRequired(mode)) {
    const existingKeys = await listAppSecretKeys(appId, region);
    key = await PromptService.promptSelectionWithAutoComplete('Enter key for secret variable', existingKeys, {
      includeInputInSelection: true,
    });
  }

  return key;
};

const promptForValueIfNotProvided = async (mode: APP_SECRET_MANAGEMENT_MODES, value?: string) => {
  if (!value && isValueRequired(mode)) {
    value = await PromptService.promptForHiddenInput(
      'value',
      'Enter value for secret variable',
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

export default class Secret extends AuthenticatedCommand {
  static description = 'Manage secret variables for your app hosted on monday-code.';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = Secret.serializeFlags(
    addRegionToFlags({
      appId: Flags.integer({
        char: 'i',
        aliases: ['a'],
        description: 'The id of the app to manage secret variables for',
      }),
      mode: Flags.string({
        char: 'm',
        description: 'management mode',
        options: Object.values(APP_SECRET_MANAGEMENT_MODES),
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
  DEBUG_TAG = 'secret';
  public async run(): Promise<void> {
    try {
      const { flags } = await this.parse(Secret);
      const { region: strRegion } = flags;
      const region = getRegionFromString(strRegion);
      let { mode, key, value, appId } = flags as ManageAppSecretFlags;

      if (!appId) {
        appId = Number(await DynamicChoicesService.chooseApp());
      }

      const selectedRegion = await chooseRegionIfNeeded(region, { appId });
      mode = await promptForModeIfNotProvided(mode);
      key = await promptForKeyIfNotProvided(mode, appId, key, selectedRegion);
      value = await promptForValueIfNotProvided(mode, value);
      this.preparePrintCommand(this, { appId, mode, key, value, region: selectedRegion });
      await handleSecretRequest(appId, mode, key, value, selectedRegion);
    } catch (error: any) {
      logger.debug(error, this.DEBUG_TAG);

      // need to signal to the parent process that the command failed
      process.exit(1);
    }
  }
}
