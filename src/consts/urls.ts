export const versionIdDeploymentUrl = (appVersionId: number): string => {
  return `/deployments/appfeature/${appVersionId}`;
};

export const getVersionStatusDeploymentUrl = (appVersionId: number): string => {
  return `${versionIdDeploymentUrl(appVersionId)}`;
};

export const deploymentSignUrl = (appVersionId: number): string => {
  return `${versionIdDeploymentUrl(appVersionId)}/signed-url`;
};
