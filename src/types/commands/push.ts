export type PushCommandTasksContext = {
  signedCloudStorageUrl?: string;
  archiveContent?: Buffer;
  archivePath?: string;
  appVersionId: number;
  showPrepareEnvironmentTask?: boolean;
  showUploadAssetTask?: boolean;
  showHandleDeploymentTask?: boolean;
  stopDeploymentTaskOnConflictError?: boolean;
  directoryPath?: string;
};
