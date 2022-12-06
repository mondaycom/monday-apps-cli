import { LOGIN_TYPES } from '../shared/login';

export type LoginCommandArguments = {
  password?: string;
  email?: string;
  method: LOGIN_TYPES;
};
