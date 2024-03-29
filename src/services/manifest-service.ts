import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { load } from 'js-yaml';

import { BadConfigError } from 'errors/bad-config-error';
import { ManifestFileSchema } from 'services/schemas/manifest-service-schemas';
import { BUILD_TYPES, BUILD_TYPES_MANIFEST_FORMAT } from 'types/services/app-features-service';
import logger from 'utils/logger';

const MANIFEST_FILE_NAME = 'app-manifest.yml';
const ENCODING = 'utf8';

const checkConfigExists = (directoryPath: string, fileName = MANIFEST_FILE_NAME) => {
  const filePath = join(directoryPath, fileName);
  return existsSync(filePath);
};

export const readManifestFile = (directoryPath: string, fileName = MANIFEST_FILE_NAME) => {
  if (!checkConfigExists(directoryPath, fileName)) {
    throw new BadConfigError(`the file: ${fileName} is not found in ${directoryPath}`);
  }

  const filePath = join(directoryPath, fileName);
  const stringifiedData = readFileSync(filePath, { encoding: ENCODING });
  const data = load(stringifiedData);
  try {
    return ManifestFileSchema.parse(data);
  } catch (error) {
    logger.error(error);
    throw new BadConfigError(`the file: ${fileName} is not valid`);
  }
};

export const getManifestAssetPath = (manifestPath: string, relativePath: string) => {
  const assetPath = join(manifestPath, relativePath);
  return assetPath;
};

export const buildTypeManifestFormatMap = {
  [BUILD_TYPES_MANIFEST_FORMAT.CUSTOM_URL]: BUILD_TYPES.CUSTOM_URL,
  [BUILD_TYPES_MANIFEST_FORMAT.MONDAY_CODE]: BUILD_TYPES.MONDAY_CODE,
  [BUILD_TYPES_MANIFEST_FORMAT.MONDAY_CODE_CDN]: BUILD_TYPES.MONDAY_CODE_CDN,
};
