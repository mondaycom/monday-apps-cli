import { LoginTypes } from '../shared/login';

export type LoginCommandArguments = {
  password?: string;
  email?: string;
  method: LoginTypes;
};
