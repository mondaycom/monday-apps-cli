export const appFeatureIdDeploymentUrl = (appFeatureId: number): string => {
  return `/deployments/appFeature/${appFeatureId}`;
};

export const getAppFeatureDeploymentUrl = (appFeatureId: number): string => {
  return `${appFeatureIdDeploymentUrl(appFeatureId)}`;
};

export const deploymentSignUrl = (appFeatureId: number): string => {
  return `${appFeatureIdDeploymentUrl(appFeatureId)}/signed-url`;
};
