import { LoginTypes } from 'types/shared/login';

export type LoginCommandArguments = {
  password?: string;
  email?: string;
  method: LoginTypes;
};
