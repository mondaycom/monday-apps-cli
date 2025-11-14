export interface ProjectTemplate {
  name: string;
  isWithSigningSecret?: boolean;
  openSetupMd?: boolean;
}

export interface ScaffoldTaskContext {
  project: ProjectTemplate;
  destination: string;
  signingSecret?: string;
  projectPath: string;
  startCommand: string;
}

