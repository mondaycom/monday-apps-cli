import { LOGIN_TYPES } from '../shared/login';

export type LoginArguments = {
  password?: string;
  email?: string;
  method?: LOGIN_TYPES;
};
