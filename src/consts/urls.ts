export const appFeatureIdDeploymentUrl = (appFeatureId: number): string => {
  return `/deployments/appfeature/${appFeatureId}`;
};

export const getAppFeatureDeploymentUrl = (appFeatureId: number): string => {
  return `${appFeatureIdDeploymentUrl(appFeatureId)}`;
};

export const deploymentSignUrl = (appFeatureId: number): string => {
  return `${appFeatureIdDeploymentUrl(appFeatureId)}/signed-url`;
};
