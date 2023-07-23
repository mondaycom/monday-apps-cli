import { SECRETS_MANAGEMENT_MODES } from 'consts/secrets';
import { AppId } from 'types/general';

export type SecretsFlags = {
  mode?: SECRETS_MANAGEMENT_MODES;
  key?: string;
  secret?: string;
  appId?: AppId;
};
