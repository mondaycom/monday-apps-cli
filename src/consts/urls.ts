export const versionIdDeploymentUrl = (appVersionId: number): string => {
  return `/deployments/${appVersionId}`;
};

export const getVersionStatusDeploymentUrl = (appVersionId: number): string => {
  return `${versionIdDeploymentUrl(appVersionId)}/status`;
};

export const deploymentSignUrl = (appVersionId: number): string => {
  return `${versionIdDeploymentUrl(appVersionId)}/signed-url`;
};
