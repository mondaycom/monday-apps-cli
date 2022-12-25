import { geMondayCodeDomain } from '../services/env-service.js';
const apiVersion = '/api/v1';
const urlBuilder = (url: string): string => {
  const baseDomain = geMondayCodeDomain();
  const constructedUrl = new URL(apiVersion + url, baseDomain);
  return constructedUrl.href;
};

export default urlBuilder;
