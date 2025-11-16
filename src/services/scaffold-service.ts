import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { ensureDir } from 'fs-extra';
import { ListrTaskWrapper } from 'listr2';

import { MONDAY_GITHUB_REPO, MONDAY_GITHUB_REPO_BRANCH, MONDAY_GITHUB_REPO_URL } from 'consts/scaffold';
import { cloneFolderFromGitRepo } from 'services/git-service';
import { ScaffoldTaskContext } from 'types/commands/scaffold';
import logger from 'utils/logger';

const DEBUG_TAG = 'scaffold_service';
const isWindows = () => process.platform === 'win32';
const npmCmd = isWindows() ? 'npm.cmd' : 'npm';

export const downloadTemplateTask = async (
  ctx: ScaffoldTaskContext,
  task: ListrTaskWrapper<ScaffoldTaskContext, any>,
) => {
  const output = (data: string) => {
    task.output = data;
  };

  task.title = 'Downloading template from GitHub';
  const gitRepoUrl = `https://github.com/${MONDAY_GITHUB_REPO}`;
  const folderPath = `apps/${ctx.project.name}`;

  await cloneFolderFromGitRepo(gitRepoUrl, folderPath, MONDAY_GITHUB_REPO_BRANCH, ctx.projectPath, output);
  task.title = 'Template downloaded successfully';
};

export const editEnvFileTask = async (ctx: ScaffoldTaskContext, task: ListrTaskWrapper<ScaffoldTaskContext, any>) => {
  task.title = 'Configuring environment variables';
  const filePath = path.join(ctx.projectPath, '.env');

  if (!fs.existsSync(filePath)) {
    task.skip('.env file not found, skipping configuration');
    return;
  }

  if (!ctx.signingSecret) {
    task.skip('No signing secret provided, skipping .env configuration');
    return;
  }

  try {
    let envLines = fs.readFileSync(filePath, 'utf8').replaceAll('\r\n', '\n').split('\n');

    // Update MONDAY_SIGNING_SECRET if provided
    envLines = envLines.map(line =>
      line.startsWith('MONDAY_SIGNING_SECRET=') ? `MONDAY_SIGNING_SECRET=${ctx.signingSecret}` : line,
    );

    fs.writeFileSync(filePath, envLines.join(os.EOL), 'utf8');
    task.title = 'Environment variables configured';
  } catch (error) {
    logger.debug(error, DEBUG_TAG);
    task.skip('Failed to configure environment variables');
  }
};

export const openSetupFileTask = async (ctx: ScaffoldTaskContext, task: ListrTaskWrapper<ScaffoldTaskContext, any>) => {
  if (!ctx.project.openSetupMd) {
    task.skip('No setup documentation for this template');
    return;
  }

  task.title = 'Opening setup documentation';
  const setupUrl = `${MONDAY_GITHUB_REPO_URL}/blob/${MONDAY_GITHUB_REPO_BRANCH}/apps/${ctx.project.name}/SETUP.md`;

  try {
    // Use native Node.js approach to open URL in browser
    const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    spawn(command, [setupUrl], { detached: true, stdio: 'ignore' }).unref();
    task.title = `Setup documentation opened in browser`;
  } catch (error) {
    logger.debug(error, DEBUG_TAG);
    task.skip(`Setup URL: ${setupUrl}`);
  }
};

export const installDependenciesTask = async (
  ctx: ScaffoldTaskContext,
  task: ListrTaskWrapper<ScaffoldTaskContext, any>,
) => {
  task.title = 'Installing npm packages';

  return new Promise<void>((resolve, reject) => {
    const installProcess = spawn(npmCmd, ['install'], {
      cwd: ctx.projectPath,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let errorOutput = '';

    installProcess.stderr?.on('data', (data: Buffer) => {
      errorOutput += data.toString();
    });

    installProcess.on('exit', code => {
      if (code === 0) {
        task.title = 'Dependencies installed successfully';
        resolve();
      } else {
        logger.debug(`npm install failed with code ${code}: ${errorOutput}`, DEBUG_TAG);
        reject(new Error(`Failed to install dependencies (exit code ${code})`));
      }
    });

    installProcess.on('error', error => {
      logger.debug(error, DEBUG_TAG);
      reject(new Error(`Failed to run npm install: ${error.message}`));
    });
  });
};

export const runProjectTask = async (ctx: ScaffoldTaskContext, task: ListrTaskWrapper<ScaffoldTaskContext, any>) => {
  task.title = 'Starting the project';

  return new Promise<void>((resolve, reject) => {
    const startProcess = spawn(npmCmd, ['run', ctx.startCommand], {
      cwd: ctx.projectPath,
      shell: true,
      stdio: 'inherit',
    });

    // Handle process cleanup on exit
    const cleanup = () => {
      if (!startProcess.killed) {
        startProcess.kill('SIGTERM');
      }
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);

    startProcess.on('exit', code => {
      if (code === 0) {
        task.title = 'Project started successfully';
        resolve();
      } else if (code !== null) {
        reject(new Error(`Project exited with code ${code}`));
      }
    });

    startProcess.on('error', error => {
      logger.debug(error, DEBUG_TAG);
      reject(new Error(`Failed to start project: ${error.message}`));
    });

    // Resolve after a short delay to let the process start
    setTimeout(() => {
      task.title = `Project is running (npm run ${ctx.startCommand})`;
      resolve();
    }, 2000);
  });
};

export const validateDestination = async (destination: string): Promise<void> => {
  try {
    await ensureDir(destination);
  } catch {
    throw new Error(`Invalid destination directory: ${destination}`);
  }
};
