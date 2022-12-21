import { signUrl } from '../consts/urls.js';
import urlBuilder from '../utils/urls-builder.js';
import Logger from '../utils/logger.js';
export const pushZipToCloud = (): void => {
  console.log(urlBuilder(signUrl), 'About to push to url');
};
