export const getNodeEnv = (): string => {
  return process.env.NODE_ENV as string;
};

export const geMondayCodeDomain = (): string => {
  return process.env.MONDAY_CODE_DOMAIN as string;
};
