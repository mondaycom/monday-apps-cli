import { Command, Flags } from '@oclif/core';

import { PrintCommandContext } from 'types/commands/base-command';
import { printGeneratedCommand } from 'utils/command-printer';
import logger from 'utils/logger';

export abstract class BaseCommand extends Command {
  protected static _withPrintCommand = true;
  private _printCommandCalled = false;
  private _printContext: PrintCommandContext = { command: this };
  protected forcefullyExitAfterRun = true;

  get printContext(): PrintCommandContext {
    return this._printContext;
  }

  set printContext(value: PrintCommandContext) {
    this._printContext = value;
  }

  static get withPrintCommand() {
    return this._withPrintCommand;
  }

  static set withPrintCommand(value: boolean) {
    this._withPrintCommand = value;
  }

  protected preparePrintCommand(command: Command, flags?: Record<string, any>, args?: Record<string, any>) {
    this._printCommandCalled = true;
    this._printContext = { command, flags, args };
  }

  public static serializeFlags<T>(flags: T): T & typeof this.sharedFlags {
    return {
      ...this.sharedFlags,
      ...flags,
    } as typeof flags & typeof this.sharedFlags;
  }

  static sharedFlags = {
    verbose: Flags.boolean({
      description: 'Print advanced logs (optional).',
      default: false,
      helpGroup: 'global',
    }),

    'print-command': Flags.boolean({
      aliases: ['pc'],
      description: 'Print the command that was executed (optional).',
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const withPrintCommand = this.constructor.withPrintCommand;
    if (withPrintCommand && !this._printCommandCalled) {
      throw new Error('Print command was not called and withPrintCommand is true');
    } else if (withPrintCommand && this._printCommandCalled) {
      printGeneratedCommand(this._printContext.command, this._printContext.flags, this._printContext.args);
    }

    if (this.forcefullyExitAfterRun) {
      return process.exit(0);
    }
  }
}
