import fs from 'node:fs';
import path from 'node:path';

import archiver from 'archiver';
import glob from 'glob';
import parseGitIgnore from 'parse-gitignore';

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
    const additionalFilesToIgnore = ['.git/**', '.env', 'local-secure-storage.db.json', '.mappsrc'];
    const pathsToIgnoreFromGitIgnore = getFilesToExcludeForArchive(directoryPath);
    const pathsToIgnore = [...pathsToIgnoreFromGitIgnore, archivePath, fullFileName, ...additionalFilesToIgnore];

    await compressDirectoryToTarGz(directoryPath, archivePath, pathsToIgnore);
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

const getFilesToExcludeForArchive = (directoryPath: string): string[] => {
  const DEBUG_TAG = 'ignore_files_for_archive';
  const mappsIgnorePath = getIgnorePath(directoryPath, '.mappsignore');
  if (mappsIgnorePath) {
    return findIgnoredFiles(directoryPath, mappsIgnorePath);
  }

  const gitIgnorePath = getIgnorePath(directoryPath, '.gitignore');
  if (gitIgnorePath) {
    return findIgnoredFiles(directoryPath, gitIgnorePath);
  }

  logger.debug(`${DEBUG_TAG} - No ignore files found, you can use .gitignore or
    .mappsignore to exclude some of the folders and files in your project`);

  return [];
};

const getIgnorePath = (directoryPath: string, ignoreFile: string): string | undefined => {
  const DEBUG_TAG = 'ignore_files_for_archive';
  logger.debug(`${DEBUG_TAG} - Searching for ${ignoreFile} file`);
  const ignoreSearchPattern = `${directoryPath}/**/${ignoreFile}`;
  const [ignorePath] = glob.sync(ignoreSearchPattern);
  return ignorePath;
};

const findIgnoredFiles = (directoryPath: string, ignorePath: string): string[] => {
  const DEBUG_TAG = 'ignore_files_for_archive';
  logger.debug(`${DEBUG_TAG} - Found ${ignorePath}`);
  logger.debug(`${DEBUG_TAG} - Creating exclude files list`);
  const parsedIgnore = parseGitIgnore.parse(ignorePath);
  logger.debug(`${DEBUG_TAG} - validating and aligning exclude files list`);
  const filesToExclude = alignPatternsForArchive(parsedIgnore?.patterns, directoryPath);
  return filesToExclude;
};

const alignPatternsForArchive = (patterns: string[], directoryPath: string): string[] => {
  const alignedPatterns = patterns?.reduce<string[]>((realPatterns, pattern) => {
    const slashCharIfNeeded = pattern[0] === '/' ? '' : '/';
    const fullPath = `${directoryPath}${slashCharIfNeeded}${pattern}`;
    if (!fs.existsSync(fullPath)) return realPatterns;
    if (fs.statSync(fullPath).isDirectory()) {
      const addGlobPattern = pattern.at(-1) === '/' ? '**' : '/**';
      const patternWithoutBeginningSlash = pattern[0] === '/' ? pattern.slice(1, pattern.length) : pattern;
      realPatterns.push(`${patternWithoutBeginningSlash}${addGlobPattern}`);
    } else {
      realPatterns.push(fullPath);
    }

    return realPatterns;
  }, []);

  return alignedPatterns;
};

const compressDirectoryToTarGz = async (
  directoryPath: string,
  archivePath: string,
  pathsToIgnore?: string[],
): Promise<string> => {
  const DEBUG_TAG = 'archive';
  logger.debug({ directoryPath, archivePath }, `${DEBUG_TAG} - Starting`);

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
    logger.debug(pathsToIgnore, `${DEBUG_TAG} - Added paths to ignore`);
    archive.glob('**/*', {
      cwd: directoryPath,
      ignore: pathsToIgnore,
      nodir: true,
      dot: true,
    });
    logger.debug(`${DEBUG_TAG} - Added directory`);

    outputStream.on('close', resolve);
    archive.on('error', reject);
    archive.finalize().catch(reject);
  });
  logger.debug(`${DEBUG_TAG} - created successfully`);

  return archivePath;
};
