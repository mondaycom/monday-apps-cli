import { Flags } from '@oclif/core';
import { LOGIN_TYPES } from '../../types/shared/login.js';
import { LoginCommandArguments } from '../../types/commands/login.js';
import { PromptService } from '../../services/prompt-service.js';
import { MondayApiService } from '../../services/monday-api-service.js';
import { BaseCommand } from '../base-command.js';
import { LOGIN_COMMAND_DESCRIPTION, LOGIN_MESSAGES } from '../../consts/messages.js';

const extractMethod = async (flags: { method: LOGIN_TYPES | undefined }): Promise<LOGIN_TYPES> => {
  const method =
    flags.method ||
    (await PromptService.promptSelectionWithAutoComplete<LOGIN_TYPES>(
      LOGIN_MESSAGES.method,
      Object.values(LOGIN_TYPES),
    ));

  return method;
};

export default class Login extends BaseCommand {
  static description = LOGIN_COMMAND_DESCRIPTION;

  static examples = ['<%= config.bin %> <%= command.id %> -m credentials -e exa@ple.com'];

  static flags = {
    ...BaseCommand.globalFlags,
    method: Flags.enum<LOGIN_TYPES>({
      char: 'm',
      description: LOGIN_MESSAGES.method,
      options: Object.values(LOGIN_TYPES),
    }),
    email: Flags.string({
      char: 'e',
      description: LOGIN_MESSAGES.email,
      dependsOn: ['method'],
    }),
  };

  static args = [];
  public async run(): Promise<void> {
    const { flags } = await this.parse(Login);

    const args: LoginCommandArguments = {
      method: await extractMethod(flags),
    };

    if (args.method === LOGIN_TYPES.credentials) {
      args.email = flags.email || (await PromptService.promptForEmail());
      args.password = await PromptService.promptForPassword();
    }

    await MondayApiService.login(args);
  }
}
