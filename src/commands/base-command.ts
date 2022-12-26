import { Command, Flags } from '@oclif/core';
import { ERROR_ON_UPLOADING_FILE } from '../consts/messages.js';

export abstract class BaseCommand extends Command {
  static globalFlags = {
    verbose: Flags.boolean({
      char: 'd',
      description: ERROR_ON_UPLOADING_FILE,
    }),
  };
}
