import { signUrl } from '../consts/urls';
import urlBuilder from '../utils/urls-builder';
import Logger from '../utils/logger.js';
export const pushZipToCloud = (): void => {
  Logger.log(urlBuilder(signUrl), 'About to push to url');
};
