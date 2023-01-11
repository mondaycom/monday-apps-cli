import { geMondayCodeDomain } from '../services/env-service.js';
const urlBuilder = (url: string): string => {
  const baseDomain = geMondayCodeDomain();
  const constructedUrl = new URL(url, baseDomain);
  return constructedUrl.href;
};

export default urlBuilder;
