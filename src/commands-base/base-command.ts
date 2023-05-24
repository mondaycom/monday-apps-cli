import { Command, Flags } from '@oclif/core';

export abstract class BaseCommand extends Command {
  public static serializeFlags<T>(flags: T): T & typeof this.sharedFlags {
    return {
      ...this.sharedFlags,
      ...flags,
    } as typeof flags & typeof this.sharedFlags;
  }

  static sharedFlags? = {
    verbose: Flags.boolean({
      description: 'Print advanced logs (optional).',
      default: false,
      helpGroup: 'global',
    }),
  };

  protected async catch(err: Error & { exitCode?: number }): Promise<any> {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    return super.catch(err);
  }

  protected async finally(_: Error | undefined): Promise<any> {
    // called after run and catch regardless of whether the command errored
    return super.finally(_);
  }
}
