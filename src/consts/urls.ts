export const versionIdUrl = (appVersionId: number): string => {
  return `/deployments/${appVersionId}`;
};

export const getVersionStatusUrl = (appVersionId: number): string => {
  return `${versionIdUrl(appVersionId)}/status`;
};

export const signUrl = (appVersionId: number): string => {
  return `${versionIdUrl(appVersionId)}/signed-url`;
};
