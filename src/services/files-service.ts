import fs from 'node:fs';
import path from 'node:path';
import glob from 'glob';
import archiver from 'archiver';
import parseGitIgnore from 'parse-gitignore';
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
    logger.debug(`${DEBUG_TAG} - Check directory exists`, { directoryPath });
    const directoryExists = fs.existsSync(directoryPath);
    if (!directoryExists) {
      throw new Error(`Directory not found: ${directoryPath}`);
    }

    const archivePath = `${directoryPath}/${fileName}.tar.gz`;
    const fullFileName = `**/${fileName}.tar.gz`;
    const pathsToIgnoreFromGitIgnore = getFilesToExcludeForArchive(directoryPath);
    const pathsToIgnore = [...pathsToIgnoreFromGitIgnore, archivePath, fullFileName];

    await compressDirectoryToTarGz(directoryPath, archivePath, pathsToIgnore);
    return archivePath;
  } catch (error) {
    logger.debug(DEBUG_TAG, error);
    throw new Error('Failed in creating archive');
  }
};

const getFilesToExcludeForArchive = (directoryPath: string): string[] => {
  const DEBUG_TAG = '.gitignore';
  logger.debug(`${DEBUG_TAG} - Searching for .gitignore file`);
  const searchPattern = `${directoryPath}/**/.gitignore`;
  const [gitIgnorePath] = glob.sync(searchPattern);
  if (gitIgnorePath) {
    logger.debug(`${DEBUG_TAG} - Found .gitignore in: ${gitIgnorePath}`);
    logger.debug(`${DEBUG_TAG} - Creating exclude files list`);
    const parsedGitIgnore = parseGitIgnore.parse(gitIgnorePath);
    logger.debug(`${DEBUG_TAG} - validating and aligning exclude files list`);
    const filesToExclude = alignPatternsForArchive(parsedGitIgnore?.patterns, directoryPath);
    return filesToExclude;
  }

  logger.debug(`${DEBUG_TAG} - No .gitignore found`);
  return [];
}

const alignPatternsForArchive = (patterns: string[], directoryPath: string): string[] => {
  const alignedPatterns = patterns?.reduce<string[]>((realPatterns, pattern) => {
    const slashCharIfNeeded = pattern[0] === '/' ? '' : '/';
    const fullPath = `${directoryPath}${slashCharIfNeeded}${pattern}`;
    if (!fs.existsSync(fullPath)) return realPatterns;
    if (fs.statSync(fullPath).isDirectory()) {
      const addGlobPattern = pattern[pattern.length - 1] === '/' ? '**' : '/**';
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
  logger.debug(`${DEBUG_TAG} - Starting`, { directoryPath, archivePath });

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
    logger.debug(`${DEBUG_TAG} - Added paths to ignore`, pathsToIgnore);
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
