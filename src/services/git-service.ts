import { spawn } from 'node:child_process';
import * as path from 'node:path';

import fs from 'fs-extra';

import logger from 'utils/logger';

export const prettyPrint = (data: string) => {
  const oneLineData = data.toString().replaceAll('\n', ' ').replaceAll('\r', ' ');
  return oneLineData.slice(0, 80);
};

export const cloneFolderFromGitRepo = async (
  gitRepoUrl: string,
  folderPath: string,
  branch: string,
  targetPath: string,
  output: (data: string) => void,
) => {
  const tempRepoPath = path.join('tempRepo');

  try {
    output(`Cloning ${folderPath} from ${gitRepoUrl}#${branch} to ${targetPath}`);
    await new Promise<void>((resolve, reject) => {
      const cloneProcess = spawn('git', [
        'clone',
        '--progress',
        '--single-branch',
        '--branch',
        branch,
        gitRepoUrl,
        tempRepoPath,
      ]);
      cloneProcess.on('exit', code => {
        if (code === 0) return resolve();
        reject(new Error(`Failed to clone ${gitRepoUrl}`));
      });
      cloneProcess.stderr?.on('data', data => {
        output(prettyPrint(data as string));
      });
    });

    // Move the specific folder to the desired location
    await fs.move(path.join(tempRepoPath, folderPath), targetPath, { overwrite: true });
  } catch (error) {
    logger.error(`Error cloning ${folderPath} from ${gitRepoUrl}#${branch} to ${targetPath}:`, error);
    throw error;
  } finally {
    await fs.remove(tempRepoPath);
  }
};
