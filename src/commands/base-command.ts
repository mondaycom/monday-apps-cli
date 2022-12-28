import { Command, Flags } from '@oclif/core';

export abstract class BaseCommand extends Command {
  static globalFlags = {
    verbose: Flags.boolean({
      description: 'Print advanced logs (optional).',
    }),
  };
}
