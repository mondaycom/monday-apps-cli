import {signUrl} from '../consts/urls.js';
import urlBuilder from '../utils/urls-builder.js';
import {SignedUrl} from '../types/services/push-service';
import axios from 'axios';
import {execute} from './monday-code-service.js';
import {HTTP_METHOD_TYPES} from '../types/services/monday-code-service.js';

export const getSignedStorageUrl = async (accessToken: string, appVersionId: number): Promise<string> => {
  const baseSignUrl = signUrl(appVersionId);
  const url = urlBuilder(baseSignUrl);
  const response = await execute<SignedUrl>({url, headers: { Accept: 'application/json' }, method: HTTP_METHOD_TYPES.POST})
  return response.signed;
};

export const uploadFileToStorage = async (
  cloudStorageUrl: string,
  fileData: Buffer,
  fileType: string,
): Promise<any> => {
  const response = await axios.put(cloudStorageUrl, fileData, {
    headers: { 'Content-Type': fileType },
  });
  return response;
};
