export const getNodeEnv = (): string => {
  return process.env.NODE_ENV!;
};

export const getAppsDomain = (): string => {
  const mondayCodeDomain = process.env.APPS_DOMAIN! || 'https://monday-apps-ms.monday.com';
  return mondayCodeDomain;
};

export const initCurrentWorkingDirectory = (): string => {
  process.env.CURRENT_WORKING_DIRECTORY = process.cwd();
  return process.env.CURRENT_WORKING_DIRECTORY;
};

export const getCurrentWorkingDirectory = (): string => {
  return process.env.CURRENT_WORKING_DIRECTORY!;
};
