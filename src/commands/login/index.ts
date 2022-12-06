import { Command, Flags } from '@oclif/core';
import { LOGIN_TYPES } from '../../types/shared/login.js';
import { LoginCommandArguments } from '../../types/commands/login.js';
import { PromptService } from '../../services/prompt-service.js';
import { MondayApiService } from '../../services/monday-api-service.js';

const MESSAGES = {
  method: 'Login method to monday.com',
  email: 'Your monday.com email',
  password: 'Your monday.com password',
};

const extractMethod = async (flags: { method: LOGIN_TYPES | undefined }): Promise<LOGIN_TYPES> => {
  const method =
    flags.method ||
    (await PromptService.promptSelectionWithAutoComplete<LOGIN_TYPES>(MESSAGES.method, Object.values(LOGIN_TYPES)));

  return method;
};

export default class Login extends Command {
  static description = 'Login to monday.com to make full use of `mcode`';

  static examples = ['<%= config.bin %> <%= command.id %> -m credentials -e exa@ple.com'];

  static flags = {
    method: Flags.enum<LOGIN_TYPES>({
      char: 'm',
      description: MESSAGES.method,
      options: Object.values(LOGIN_TYPES),
    }),
    email: Flags.string({
      char: 'e',
      description: MESSAGES.email,
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
