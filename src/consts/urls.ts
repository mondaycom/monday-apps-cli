export const versionStatus = (appVersionId: number): string => {
    return `/deployments/${appVersionId}`;
}

export const startDeployment = (): string => {
    return '/deployments';
}

export const signUrl = (appVersionId: number): string => {
    return `/deployments/${appVersionId}/signed-url`;
}
