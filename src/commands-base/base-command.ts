import { Command, Flags } from '@oclif/core';

import logger from 'utils/logger';

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

  protected catch(err: Error & { exitCode?: number }): any {
    err?.message && logger.error((err as Error).message);
    logger.debug(err);
    return process.exit(1);
  }

  protected async finally(_: Error | undefined): Promise<any> {
    // called after run and catch regardless of whether the command errored
    return super.finally(_);
  }
}
