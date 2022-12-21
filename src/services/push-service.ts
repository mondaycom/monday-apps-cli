import { signUrl } from '../consts/urls.js';
import urlBuilder from '../utils/urls-builder.js';
import Logger from '../utils/logger.js';
import {PushCommandArguments} from '../types/commands/push';

export const getSignedUrl = (config: PushCommandArguments): void => {
  const signUrlWithVersion = signUrl.replace('{{appVersionId}}', config.version!);
  const url = urlBuilder(signUrlWithVersion);
  Logger.log(url, 'About to push to url');
};

export const pushZipToCloud = (config: PushCommandArguments): void => {
  const urlToGetSignUrl = signUrl.replace('{{appVersionId}}', config.version!);
  Logger.log(urlBuilder(urlToGetSignUrl), 'About to push to url');
};
