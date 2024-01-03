export enum ManifestHostingType {
  Upload = 'upload',
  Github = 'github',
  Url = 'url',
}

export type ManifestHostingData = {
  type: ManifestHostingType;
  path: string;
};

export type ManifestHosting = {
  cdn?: ManifestHostingData;
  server?: ManifestHostingData;
};

export type ManifestApp = {
  id?: string;
  hosting?: ManifestHosting;
};

export type ManifestFile = {
  manifestVersion: string;
  app: ManifestApp;
};
