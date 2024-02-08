export const getNodeEnv = (): string => {
  return process.env.NODE_ENV!;
};

export const getAppsDomain = (): string => {
  const appsDomain = process.env.APPS_DOMAIN! || 'http://monday-apps-ms.llama.fan'; // 'https://monday-apps-ms.monday.com';
  return appsDomain;
};

export const getMondayDomain = (): string => {
  const mondayDomain = process.env.MONDAY_DOMAIN! || 'http://monday.llama.fan'; // 'https://monday.com';
  return mondayDomain;
};

export const initCurrentWorkingDirectory = (): string => {
  process.env.CURRENT_WORKING_DIRECTORY = process.cwd();
  return process.env.CURRENT_WORKING_DIRECTORY;
};

export const getCurrentWorkingDirectory = (): string => {
  return process.env.CURRENT_WORKING_DIRECTORY!;
};
