import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { load } from 'js-yaml';

import { BadConfigError } from 'errors/bad-config-error';
import { ManifestFileSchema } from 'types/services/manifest-service';

const MANIFEST_FILE_NAME = 'manifest.yml';
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
  const manifestFileData = ManifestFileSchema.parse(data);
  return manifestFileData;
};

export const getManifestAssetPath = (manifestPath: string, relativePath: string) => {
  const assetPath = join(manifestPath, relativePath);
  return assetPath;
};
