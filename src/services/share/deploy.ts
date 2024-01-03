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

export const getTasksForClientSide = (appVersionId: number, directoryPath?: string) => {
  return new Listr<PushCommandTasksContext>(
    [
      { title: 'Build asset to deploy', task: buildClientZip },
      {
        title: 'Deploying client side files',
        task: deployClientZip,
      },
    ],
    {
      ctx: { appVersionId, directoryPath },
    },
  );
};

export const getTasksForServerSide = (appVersionId: number, directoryPath?: string) => {
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
    { ctx: { appVersionId, directoryPath } },
  );
};
