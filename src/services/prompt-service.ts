import fuzzy from 'fuzzy';
import inquirer from 'inquirer';
import autocomplete from 'inquirer-autocomplete-prompt';
import DatePrompt from 'inquirer-date-prompt';
import isEmail from 'isemail';

import { APP_ID_TO_ENTER, APP_VERSION_ID_TO_ENTER } from 'consts/messages';
import { checkIfFileExists, getFileExtension } from 'services/files-service.js';
import { SelectionWithAutoCompleteOptions } from 'types/services/prompt-service';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
inquirer.registerPrompt('date', DatePrompt);
inquirer.registerPrompt('autocomplete', autocomplete);

function validateIfRequired(input: string, message: string, isRequired = false): boolean | string {
  if (isRequired && !input) {
    return message;
  }

  return true;
}

export function validateIfValueIsANumber(input: string, message: string, isRequired = false): boolean | string {
  // If not required and input is empty, it's valid
  if (!isRequired && !input) {
    return true;
  }

  // If required and input is empty, return error
  if (isRequired && !input) {
    return message;
  }

  // Check if it's a valid non-negative integer (including 0)
  const isNumber = /^\d+$/.test(input);
  if (!isNumber) {
    return message;
  }

  return true;
}

export const PromptService = {
  async promptList(message: string, choices: string[], defaultValue?: string) {
    const res = await inquirer.prompt<{ selection: string }>([
      {
        name: 'selection',
        message: message || 'Please choose one of the values',
        type: 'list',
        choices,
        ...(defaultValue && { default: defaultValue }),
      },
    ]);

    return res.selection;
  },

  async promptDateTimePicker(message: string, selectedDate = new Date(), options: any = {}): Promise<Date> {
    const baseOptions = {
      type: 'date',
      name: 'timestamp',
      message,
      default: selectedDate,
      locale: 'en-US',
      format: { month: 'short', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' },
      clearable: false,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const config: any = Object.assign(baseOptions, options);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const prompt = await inquirer.prompt(config);
    return prompt.timestamp! as Date;
  },

  async promptConfirm(message: string, defaultValue = false) {
    const res = await inquirer.prompt<{ confirm: boolean }>([
      {
        name: 'confirm',
        message: message || 'Are you sure?',
        type: 'confirm',
        default: defaultValue,
      },
    ]);

    return res.confirm;
  },

  async promptForEmail(message?: string) {
    const res = await inquirer.prompt<{ email: string }>([
      {
        name: 'email',
        message: message || 'Please enter your email',
        type: 'input',
        validate(input: string) {
          if (!input) return 'You must enter your email';
          if (!isEmail.validate(input)) return 'You must enter a valid email - <local-part>@<domain>';
          return true;
        },
      },
    ]);

    return res.email;
  },

  async promptForHiddenInput(name: string, message: string, validationMessage: string) {
    const res = await inquirer.prompt<{ [name: string]: string }>([
      {
        name,
        message,
        type: 'password',
        validate(input: string) {
          return validateIfRequired(input, validationMessage, true);
        },
      },
    ]);

    return res[name];
  },

  async promptForPassword() {
    return this.promptForHiddenInput('password', 'Please enter your password', 'You must enter a password');
  },

  async promptInput(message: string, required = false, allowUndefined = false): Promise<string> {
    const res = await inquirer.prompt<{ input: string }>([
      {
        name: 'input',
        message: message || 'Please enter value',
        type: 'input',
        validate(input: string) {
          return validateIfRequired(input, 'You must enter a value', required);
        },
      },
    ]);

    if (allowUndefined && (!res.input || (typeof res.input === 'string' && res.input === ''))) {
      return undefined as unknown as string;
    }

    return res.input;
  },

  async promptInputNumber(message: string, required = false, allowUndefined = false): Promise<number> {
    const res = await inquirer.prompt<{ input: number }>([
      {
        name: 'input',
        message: message || 'Please enter value',
        type: 'input',
        validate(input: string) {
          return validateIfValueIsANumber(input, 'You must enter a number', required);
        },
      },
    ]);

    if (allowUndefined && (!res.input || (typeof res.input === 'string' && res.input === ''))) {
      return undefined as unknown as number;
    }

    return Number(res.input);
  },

  async promptFile(message: string, extensions: string[]) {
    const res = await inquirer.prompt<{ filePath: string }>([
      {
        name: 'filePath',
        message: message || 'Please type full file path',
        type: 'input',
        extensions,
        validate(input: string) {
          if (!input) return 'You must enter valid file path';
          if (!checkIfFileExists(input)) return 'You must enter valid file path';
          if (extensions && extensions.length > 0 && !extensions.includes(getFileExtension(input).toLowerCase())) {
            return `The process supports those file extensions: ${extensions.join(',')}`;
          }

          return true;
        },
      },
    ]);

    return res.filePath;
  },

  async promptSelectionWithAutoComplete<T>(
    message: string,
    choices: string[],
    options: SelectionWithAutoCompleteOptions = {},
  ): Promise<T> {
    const fuzzySearch = (_answers: string[], input = '') => {
      return new Promise(resolve => {
        const finalChoices = options.includeInputInSelection && input ? [...new Set([...choices, input])] : choices;
        // eslint-disable-next-line import/no-named-as-default-member
        const results = fuzzy.filter(input, finalChoices).map(element => element.original);
        resolve(results);
      });
    };

    const res = await inquirer.prompt<{ selection: T }>([
      {
        name: 'selection',
        message: message || 'Please choose one of the values',
        type: 'autocomplete',
        source: fuzzySearch,
        ...options,
      },
    ]);

    return res.selection;
  },

  async appVersionPrompt() {
    return PromptService.promptInputNumber(APP_VERSION_ID_TO_ENTER, true);
  },

  async appPrompt() {
    return PromptService.promptInputNumber(APP_ID_TO_ENTER, true);
  },
};
