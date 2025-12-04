import { Listr } from 'listr2';

import {
  buildAssetToDeployTask,
  buildClientZip,
  deployClientZip,
  handleDeploymentTask,
  prepareEnvironmentTask,
  uploadAssetTask,
} from 'services/push-service';
import { PushCommandTasksContext } from 'types/commands/push';
import { Region } from 'types/general/region';

export const getTasksForClientSide = (appVersionId: number, directoryPath?: string, region?: Region) => {
  const ctx = { appVersionId, directoryPath, region };
  return new Listr<PushCommandTasksContext>(
    [
      { title: 'Build asset to deploy', task: buildClientZip },
      {
        title: 'Deploying client side files',
        task: deployClientZip,
      },
    ],
    {
      ctx,
    },
  );
};

export const getTasksForServerSide = (
  appVersionId: number,
  directoryPath?: string,
  region?: Region,
  securityScan?: boolean,
) => {
  const ctx = { appVersionId, directoryPath, region, securityScan };
  return new Listr<PushCommandTasksContext>(
    [
      { title: 'Build asset to deploy', task: buildAssetToDeployTask },
      {
        title: 'Preparing environment',
        task: prepareEnvironmentTask,
        enabled: ctx => Boolean(ctx.showPrepareEnvironmentTask),
      },
      {
        title: 'Uploading built asset',
        task: uploadAssetTask,
        enabled: ctx => Boolean(ctx.showUploadAssetTask),
      },
      {
        title: 'Deployment in progress',
        task: handleDeploymentTask,
        enabled: ctx => Boolean(ctx.showHandleDeploymentTask),
      },
    ],
    { ctx },
  );
};
