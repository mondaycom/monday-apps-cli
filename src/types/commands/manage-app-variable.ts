import { APP_VARIABLE_MANAGEMENT_MODES } from 'consts/manage-app-variables';
import { AppId } from 'types/general';

export type ManageAppVariableFlags = {
  mode?: APP_VARIABLE_MANAGEMENT_MODES;
  key?: string;
  value?: string;
  appId?: AppId;
};
