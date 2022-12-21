import { geMondayCodeDomain } from '../services/env-service';

const urlBuilder = (url: string): string => {
  const constructedUrl = new URL(url, geMondayCodeDomain()) as URL;
  return constructedUrl.href;
};

export default urlBuilder;
