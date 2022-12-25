import fs from 'node:fs';

export const readFileData = (filePath: string): Buffer => {
  if (!checkIfFileExists(filePath)) {
    throw new Error(`File is not exists in this location: "${filePath}"`)
  }

  const fileData = fs.readFileSync(filePath);
  return fileData;
};

export const checkIfFileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};
