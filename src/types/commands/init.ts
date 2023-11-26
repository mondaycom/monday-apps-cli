import { CONFIG_KEYS } from 'consts/config';

export type InitCommandArguments = {
  [CONFIG_KEYS.ACCESS_TOKEN]?: string;
  [CONFIG_KEYS.SERVER_SIDE_PATH]?: string;
  [CONFIG_KEYS.CLIENT_SIDE_PATH]?: string;
};
