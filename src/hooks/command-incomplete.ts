import { Hook, toConfiguredId, toStandardizedId } from '@oclif/core';

import { PromptService } from 'services/prompt-service';

const hook: Hook.CommandIncomplete = async function ({ config, matches, argv }) {
  const possibleCommands = matches.map(p => toConfiguredId(p.id, config));
  const command = await PromptService.promptList('Which of these commands would you like to run?', possibleCommands);

  if (argv.includes('--help') || argv.includes('-h')) {
    return config.runCommand('help', [toStandardizedId(command, config)]);
  }

  return config.runCommand(toStandardizedId(command, config), argv);
};

export default hook;
