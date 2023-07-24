import { APP_ENV_MANAGEMENT_MODES } from 'consts/manage-app-env';
import { AppId } from 'types/general';

export type ManageAppEnvFlags = {
  mode?: APP_ENV_MANAGEMENT_MODES;
  key?: string;
  value?: string;
  appId?: AppId;
};
