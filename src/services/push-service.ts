import { signUrl } from '../consts/urls.js';
import urlBuilder from '../utils/urls-builder.js';
import Logger from '../utils/logger.js';
import { PushCommandArguments } from '../types/commands/push';
import { SignedUrl } from '../types/services/push-service';
import axios from 'axios';
import { readFileSync } from 'node:fs';
export const getFileData = (config: PushCommandArguments): Buffer => {
  const fileData = readFileSync(config.file);
  return fileData;
};

export const getSignedCloudStorageUrl = async (accessToken: string, config: PushCommandArguments): Promise<string> => {
  const signUrlWithVersion = signUrl.replace('{{appVersionId}}', config.version!);
  const url = urlBuilder(signUrlWithVersion);
  const response = await axios.post(url, null, {
    headers: { Accept: 'application/json', Authorization: accessToken },
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
