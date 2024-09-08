import { APP_SECRET_MANAGEMENT_MODES } from 'consts/manage-app-secret';
import { AppId } from 'types/general';

export type ManageAppSecretFlags = {
  mode?: APP_SECRET_MANAGEMENT_MODES;
  key?: string;
  value?: string;
  appId?: AppId;
};
