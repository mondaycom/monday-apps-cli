import { getAppsDomain } from 'services/env-service';

const appsUrlBuilder = (url: string): string => {
  const baseDomain = getAppsDomain();
  const constructedUrl = new URL(url, baseDomain);
  return constructedUrl.href;
};

const getLastParam = (url: string): string => {
  return url.split('/').pop() || url;
};

const addPrefixIfNotExists = (url: string, prefix: string): string => {
  if (url.startsWith(prefix)) {
    return url;
  }

  return `${prefix}${url}`;
};

export { addPrefixIfNotExists, appsUrlBuilder, getLastParam };
