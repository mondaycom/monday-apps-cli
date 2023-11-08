import fs from 'node:fs';
import path from 'node:path';
import os from 'os';
import archiver from 'archiver';
import { glob, sync } from 'glob-gitignore';
import ignore, { Ignore } from 'ignore';

import { CONFIG_NAME } from 'services/config-service';

import logger from '../utils/logger.js';

export const readFileData = (filePath: string): Buffer => {
  if (!checkIfFileExists(filePath)) {
    throw new Error(`File not found: "${filePath}"`);
  }

  const fileData = fs.readFileSync(filePath);
  return fileData;
};

export const checkIfFileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};

export const getFileExtension = (filePath: string): string => {
  return path.extname(filePath).slice(1);
};

export const createTarGzArchive = async (directoryPath: string, fileName = 'code'): Promise<string> => {
  const DEBUG_TAG = 'create_archive';
  try {
    logger.debug({ directoryPath }, `${DEBUG_TAG} - Check directory exists`);
    const directoryExists = fs.existsSync(directoryPath);
    if (!directoryExists) {
      throw new Error(`Directory not found: ${directoryPath}`);
    }

    const archivePath = `${directoryPath}/${fileName}.tar.gz`;
    const fullFileName = `**/${fileName}.tar.gz`;

    // a special list of files to ignore that are not in .gitignore that is may or may not be in the project
    const additionalFilesToIgnore = ['.git/**', '.env', 'local-secure-storage.db.json', '.mappsrc', 'node_modules'];
    const ignoreInstance = getFilesToExcludeForArchive(directoryPath);
    ignoreInstance.add(archivePath);
    ignoreInstance.add(fullFileName);
    ignoreInstance.add(additionalFilesToIgnore)

    await compressDirectoryToTarGz(directoryPath, archivePath, ignoreInstance);
    return archivePath;
  } catch (error) {
    logger.debug(error, DEBUG_TAG);
    throw new Error('Failed in creating archive');
  }
};

export const createGitignoreAndAppendConfigFileIfNeeded = (directoryPath: string, fileName = CONFIG_NAME) => {
  const filePath = path.join(directoryPath, '.gitignore');
  if (!checkIfFileExists(filePath)) {
    fs.writeFileSync(filePath, '', 'utf8');
  }

  const gitignoreContent = fs.readFileSync(filePath, 'utf8');
  if (!gitignoreContent.includes(fileName)) {
    fs.appendFileSync(filePath, `\n${fileName}`, 'utf8');
  }
};

/**
 * Detect if the project is yarn project with a build step
 * if so, we will need to abort the build process as
 * gcloud buildpacks does not support it yet
 * @param directoryPath the path where the project is located
 * @throws Error if the project is yarn project with a build step
 * @returns void
 **/
export const validateIfCanBuild = (directoryPath: string): void => {
  const filePath = path.join(directoryPath, 'yarn.lock');
  if (!checkIfFileExists(filePath)) {
    return;
  }

  const packageJsonPath = path.join(directoryPath, 'package.json');
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent) as { scripts?: { build?: string } };
  const hasBuildCommand = packageJson?.scripts?.build;
  if (hasBuildCommand) {
    throw new Error(
      'monday-code does not support yarn projects with a build command. If you need a build step, use npm instead',
    );
  }
};

//* ** PRIVATE METHODS ** *//

const getFilesToExcludeForArchive = (directoryPath: string): Ignore => {
  const ignoreInstance = ignore();
  const DEBUG_TAG = 'ignore_files_for_archive';
  const mappsIgnorePath = getIgnorePath(directoryPath, '.mappsignore');
  if (mappsIgnorePath) {
    ignoreInstance.add(fs.readFileSync(mappsIgnorePath).toString());
    logger.debug(`${DEBUG_TAG} - Found ${mappsIgnorePath} using it for ignoring files`);
  }
  
  const gitIgnorePath = getIgnorePath(directoryPath, '.gitignore');
  if (gitIgnorePath) {
    ignoreInstance.add(fs.readFileSync(gitIgnorePath).toString());
    logger.debug(`${DEBUG_TAG} - Found ${gitIgnorePath} using it for ignoring files`);
  }

  
  return ignoreInstance;
};


const getIgnorePath = (directoryPath: string, ignoreFile: string): string | undefined => {
  const DEBUG_TAG = 'ignore_files_for_archive';
  logger.debug(`${DEBUG_TAG} - Searching for ${ignoreFile} file`);
  const slashIfNeeded = directoryPath.at(-1) === '\\' ? '' : '/';
  let ignoreSearchPattern = `${directoryPath}${slashIfNeeded}**/${ignoreFile}`;
  if (os.platform() === 'win32') {
    ignoreSearchPattern = ignoreSearchPattern.replaceAll('\\', '/');
  }
  logger.debug(`${DEBUG_TAG} - Ignroe search pattern: ${ignoreSearchPattern}`);
  const [ignorePath] = sync(ignoreSearchPattern);
  return ignorePath;
};


const compressDirectoryToTarGz = async (
  directoryPath: string,
  archivePath: string,
  ignoreInstance: Ignore,
): Promise<string> => {
  const DEBUG_TAG = 'archive';
  logger.debug({ directoryPath, archivePath }, `${DEBUG_TAG} - Starting`);

  const files: string[] = await glob('**/*', {
    cwd: directoryPath,
    nodir: true,
    dot: true,
    ignore: ignoreInstance
  })

  const outputStream = fs.createWriteStream(archivePath);
  const archive = archiver('tar', {
    gzip: true,
    gzipOptions: {
      level: 1,
    },
  });

  logger.debug(`${DEBUG_TAG} - Initialized`);
  await new Promise((resolve, reject) => {
    archive.pipe(outputStream);
    logger.debug(`${DEBUG_TAG} - files to archive ${JSON.stringify(files)}`);
    files.forEach(file => {
      logger.debug(`${DEBUG_TAG} - Adding file ${file}`);
      archive.file(directoryPath + file, {name: file});
      logger.debug(`${DEBUG_TAG} - Added file ${file}`);
    })

    outputStream.on('close', resolve);
    archive.on('error', reject);
    archive.finalize().catch(reject);
  });
  logger.debug(`${DEBUG_TAG} - created successfully`);

  return archivePath;
};
