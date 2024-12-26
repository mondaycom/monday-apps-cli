import { AppId, AppVersionId } from 'types/general';

export type PromoteCommandTasksContext = {
  appId: AppId;
  appVersionId?: AppVersionId;
  retryAfter?: number;
  urlToPull?: string;
};
