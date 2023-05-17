import { geMondayCodeDomain, getAppsDomain } from '../services/env-service.js';
const mCodeUrlBuilder = (url: string): string => {
  const baseDomain = geMondayCodeDomain();
  const constructedUrl = new URL(url, baseDomain);
  return constructedUrl.href;
};

const appsUrlBuilder = (url: string): string => {
  const baseDomain = getAppsDomain();
  const constructedUrl = new URL(url, baseDomain);
  return constructedUrl.href;
};

export { mCodeUrlBuilder, appsUrlBuilder };
