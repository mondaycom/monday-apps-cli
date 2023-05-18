import { LoginTypes } from 'types/shared/login';

export type LoginArguments = {
  password?: string;
  email?: string;
  method?: LoginTypes;
};
