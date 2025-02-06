import type { AppId, AppVersionId } from 'types/general';

export type ImportCommandTasksContext = {
  appId?: AppId;
  appVersionId?: AppVersionId;
  manifestFilePath: string;
  templateVars?: Record<string, string>;
};
