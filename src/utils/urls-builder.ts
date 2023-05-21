import { getAppsDomain } from 'services/env-service';

const appsUrlBuilder = (url: string): string => {
  const baseDomain = getAppsDomain();
  const constructedUrl = new URL(url, baseDomain);
  return constructedUrl.href;
};

export { appsUrlBuilder };
