import { Command } from '@oclif/core';

export type PrintCommandContext = { command: Command; flags?: Record<string, any>; args?: Record<string, any> };
