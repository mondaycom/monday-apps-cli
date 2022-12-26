import { signUrl } from '../consts/urls.js';
import urlBuilder from '../utils/urls-builder.js';
import { SIGNED_URL } from '../types/services/push-service.js';
import axios from 'axios';
import { execute } from './monday-code-service.js';
import { HTTP_METHOD_TYPES } from '../types/services/monday-code-service.js';
import logger from '../utils/logger.js';
import { errorOnUploadingFile } from '../consts/messages.js';

export const getSignedStorageUrl = async (accessToken: string, appVersionId: number): Promise<string> => {
  const baseSignUrl = signUrl(appVersionId);
  const url = urlBuilder(baseSignUrl);
  const response = await execute<SIGNED_URL>({
    url,
    headers: { Accept: 'application/json' },
    method: HTTP_METHOD_TYPES.POST,
  });
  return response.signed!;
};

export const uploadFileToStorage = async (
  cloudStorageUrl: string,
  fileData: Buffer,
  fileType: string,
): Promise<any> => {
  try {
    const response = await axios.put(cloudStorageUrl, fileData, {
      headers: { 'Content-Type': fileType },
    });
    return response;
  } catch (error: any) {
    logger.debug(error);
    throw new Error(errorOnUploadingFile as string);
  }
};
