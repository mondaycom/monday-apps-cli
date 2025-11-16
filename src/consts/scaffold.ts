import { ProjectTemplate } from 'types/commands/scaffold';

export const MONDAY_GITHUB_REPO = 'mondaycom/welcome-apps';
export const MONDAY_GITHUB_REPO_URL = `https://github.com/${MONDAY_GITHUB_REPO}`;
export const MONDAY_GITHUB_REPO_BRANCH = 'master';

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  { name: 'quickstart-react' },
  { name: 'quickstart-workdocs' },
  { name: 'slack-node', isWithSigningSecret: true, openSetupMd: true },
  { name: 'word-cloud' },
  { name: 'docs-viewer' },
  { name: 'workspace-view-app' },
];
