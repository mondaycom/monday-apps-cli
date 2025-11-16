export type ProjectTemplate = {
  name: string;
  isWithSigningSecret?: boolean;
  openSetupMd?: boolean;
};

export type ScaffoldTaskContext = {
  project: ProjectTemplate;
  destination: string;
  signingSecret?: string;
  projectPath: string;
  startCommand: string;
};
