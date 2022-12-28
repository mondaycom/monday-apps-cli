import { LoginTypes } from '../shared/login';

export type LoginArguments = {
  password?: string;
  email?: string;
  method?: LoginTypes;
};
