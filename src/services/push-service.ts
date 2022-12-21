import { signUrl } from '../consts/urls.js';
import urlBuilder from '../utils/urls-builder.js';
import Logger from '../utils/logger.js';
import { PushCommandArguments } from '../types/commands/push';
import { SignedUrl } from '../types/services/push-service';
import axios from 'axios';
import fs from 'node:fs';
import { promisify } from 'node:util';
export const getFileData = async (config: PushCommandArguments): Promise<Buffer> => {
  const fsPromise = promisify(fs.readFile);
  const fileData = await fsPromise(config.file);
  return fileData;
};

export const getSignedCloudStorageUrl = async (config: PushCommandArguments): Promise<string> => {
  const signUrlWithVersion = signUrl.replace('{{appVersionId}}', config.version!);
  const url = urlBuilder(signUrlWithVersion);
  const response = await axios.post(url, null, {
    headers: { Accept: 'application/json', Authorization: config.accessToken },
  });
  const signedUrlResponse = response.data as SignedUrl;
  return signedUrlResponse.signed;
};

export const uploadFileToCloudStorage = async (
  cloudStorageUrl: string,
  fileData: Buffer,
  fileType: string,
): Promise<any> => {
  const response = await axios.put(cloudStorageUrl, fileData, {
    headers: { 'Content-Type': fileType },
  });
  return response;
};

export const pushZipToCloud = (config: PushCommandArguments): void => {
  const urlToGetSignUrl = signUrl.replace('{{appVersionId}}', config.version!);
  Logger.log(urlBuilder(urlToGetSignUrl), 'About to push to url');
};
