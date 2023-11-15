import * as ngrok from '@ngrok/ngrok';

import { AppId } from 'types/general';

export type TunnelCommandTasksContext = {
  appId: AppId | undefined;
  tunnelPort: number;
  authToken?: string;
  tunnelDomain?: string;
  forwardingAddress?: string;
  tunnel?: ngrok.Listener;
};
