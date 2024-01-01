export enum ManifestPackageType {
  Upload = 'upload',
  Github = 'github',
  Url = 'url',
}

export type ManifestPackage = {
  type: ManifestPackageType;
  path: string;
};

export type ManifestPackages = {
  client?: ManifestPackage;
  server?: ManifestPackage;
};

export type ManifestApp = {
  id?: string;
  packages?: ManifestPackages;
};

export type ManifestFile = {
  manifestVersion: string;
  app: ManifestApp;
};
