export const getNodeEnv = (): string => {
  return process.env.NODE_ENV!;
};

export const geMondayCodeDomain = (): string => {
  return process.env.MONDAY_CODE_DOMAIN!;
};

export const initCurrentWorkingDirectory = (): string => {
  process.env.CURRENT_WORKING_DIRECTORY = process.cwd();
  return process.env.CURRENT_WORKING_DIRECTORY;
};

export const getCurrentWorkingDirectory = (): string => {
  return process.env.CURRENT_WORKING_DIRECTORY!;
};
