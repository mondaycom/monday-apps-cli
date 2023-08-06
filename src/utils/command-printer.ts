import { Command } from '@oclif/core';

import { wrapInBox } from 'utils/cli-utils';
import logger from 'utils/logger';

import Flag = Command.Flag;

let printCommandEnabled = false;

export const enablePrintCommand = () => {
  printCommandEnabled = true;
};

const getFlagsAndArgsFromCommand = (command: Command) => {
  const commandClass = command.constructor as Command.Class;
  const commandFlags = commandClass.flags;
  const commandArgs = commandClass.args;

  return {
    flags: commandFlags,
    args: commandArgs,
  };
};

const addFlagsToCommandString = (
  commandString: string,
  commandFlagsMetadata: Record<string, Flag>,
  flags?: Record<string, any>,
) => {
  for (const [flagName, flag] of Object.entries(commandFlagsMetadata)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const flagValue = flags?.[flagName];
    if (flagValue) {
      const flagChar = flag?.char;
      commandString += ` -${flagChar! ? flagChar : `-${flagName}`}=${flagValue as string}`;
    }
  }

  return commandString;
};

const addArgsToCommandString = (
  commandString: string,
  commandArgsMetadata: Record<string, any>,
  args?: Record<string, any>,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [argName, _arg] of Object.entries(commandArgsMetadata)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const argValue = args?.[argName];
    if (argValue) {
      commandString += ` ${argValue as string}`;
    }
  }

  return commandString;
};

export const printGeneratedCommand = (command: Command, flags?: Record<string, any>, args?: Record<string, any>) => {
  if (!printCommandEnabled) {
    return;
  }

  const cliAlias = command.config.pjson.oclif.bin;
  const commandId = command.id;
  const { flags: commandFlagsMetadata, args: commandArgsMetadata } = getFlagsAndArgsFromCommand(command);

  let commandString = `$ ${cliAlias!} ${commandId!}`;
  commandString = addFlagsToCommandString(commandString, commandFlagsMetadata, flags);
  commandString = addArgsToCommandString(commandString, commandArgsMetadata, args);

  logger.info(`
  Use the following command for the same results:
  ${wrapInBox(commandString)}`);
};
