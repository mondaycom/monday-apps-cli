import inquirer from 'inquirer';
import autocomplete from 'inquirer-autocomplete-prompt';
import isEmail from 'isemail';
import fuzzy from 'fuzzy';
import { checkIfFileExists, getFileExtension } from './files-service.js';

inquirer.registerPrompt('autocomplete', autocomplete);

function validateIfRequired(input: string, message: string, isRequired = false): boolean | string {
  if (isRequired && !input) {
    return message;
  }

  return true;
}

function validateIfValueIsANumber(input: string, message: string, isRequired = false): boolean | string {
  if (isRequired && !input) {
    return message;
  }

  const isNumber = /^\d+$/.test(input);
  if (!isNumber) {
    return message;
  }

  return true;
}

export const PromptService = {
  async promptList(message: string, choices: string[], defaultValue: string) {
    const res = await inquirer.prompt<{ selection: string }>([
      {
        name: 'selection',
        message: message || 'Please choose one of the values',
        type: 'list',
        choices,
        default: defaultValue,
      },
    ]);

    return res.selection;
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

  async promptInput(message: string, required = false) {
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

    return res.input;
  },

  async promptInputNumber(message: string, required = false) {
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

    return res.input;
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

  async promptSelectionWithAutoComplete<T>(message: string, choices: string[]): Promise<T> {
    const search = (_answers: string[], input = '') => {
      return new Promise(resolve => {
        const results = fuzzy.filter(input, choices).map(element => element.original);
        resolve(results);
      });
    };

    const res = await inquirer.prompt<{ selection: T }>([
      {
        name: 'selection',
        message: message || 'Please choose one of the values',
        type: 'autocomplete',
        source: search,
      },
    ]);

    return res.selection;
  },
};
