/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import { Command } from '@oclif/core';

import { wrapInBox } from 'utils/cli-utils';
import logger from 'utils/logger';

import Flag = Command.Flag;

let printCommandEnabled = false;

export const enablePrintCommand = () => {
  printCommandEnabled = true;
};

export const printCommand = (
  command: Command,
  commandClass: any,
  flags?: Record<string, any>,
  args?: Record<string, any>,
) => {
  if (!printCommandEnabled) {
    return;
  }

  const cliAlias = command.config.pjson.oclif.bin;
  const commandId = command.id;
  const commandFlags = commandClass.flags;
  const commandArgs = commandClass.args;
  let commandString = `$ ${cliAlias!} ${commandId!}`;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  for (const [flagName, flag] of Object.entries(commandFlags)) {
    const flagValue = flags?.[flagName];
    if (flagValue) {
      const flagChar = (flag as Flag)?.char;
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      commandString += ` -${flagChar! ? flagChar : `-${flagName}`}=${flagValue}`;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-unsafe-argument
  for (const [argName, _arg] of Object.entries(commandArgs)) {
    const argValue = args?.[argName];
    if (argValue) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      commandString += ` ${argValue}`;
    }
  }

  logger.info(`
  Use the following command for the same results:
  ${wrapInBox(commandString)}`);
};
