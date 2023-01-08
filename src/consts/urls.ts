export const appFeatureIdDeploymentUrl = (appVersionId: number): string => {
  return `/deployments/appFeature/${appVersionId}`;
};

export const getAppFeatureDeploymentUrl = (appVersionId: number): string => {
  return `${appFeatureIdDeploymentUrl(appVersionId)}`;
};

export const deploymentSignUrl = (appVersionId: number): string => {
  return `${appFeatureIdDeploymentUrl(appVersionId)}/signed-url`;
};
