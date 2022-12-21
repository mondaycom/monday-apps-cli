import { signUrl } from '../consts/urls.js';
import urlBuilder from '../utils/urls-builder.js';
import Logger from '../utils/logger.js';
import { PushCommandArguments } from '../types/commands/push';
// import fetch from 'node-fetch';
// import { SignedUrl } from '../types/services/push-service';
import fs from 'node:fs';
import { promisify } from 'node:util';
export const getFileData = async (config: PushCommandArguments): Promise<any> => {
  const fsPromise = promisify(fs.readFile);
  const fileData = await fsPromise(config.file);
  return fileData;
};

export const getSignedUrl = async (config: PushCommandArguments): Promise<string> => {
  const signUrlWithVersion = signUrl.replace('{{appVersionId}}', config.version!);
  const url = urlBuilder(signUrlWithVersion);
  return url;
  // const response = await fetch(url, {
  //   method: 'POST',
  //   headers: { Accept: 'application/json', Authorization: config.accessToken },
  // });
  // const signedUrlResponse = (await response.json()) as SignedUrl;
  // return signedUrlResponse.signed;
};

export const pushZipToCloud = (config: PushCommandArguments): void => {
  const urlToGetSignUrl = signUrl.replace('{{appVersionId}}', config.version!);
  Logger.log(urlBuilder(urlToGetSignUrl), 'About to push to url');
};
