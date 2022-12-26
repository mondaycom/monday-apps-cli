import axios, { AxiosError } from 'axios';
import {
  EXECUTE_PARAMS,
  BASE_ERROR_RESPONSE,
  BASE_RESPONSE_HTTP_META_DATA,
} from '../types/services/monday-code-service.js';
import { ConfigService } from './config-service.js';
import Logger from '../utils/logger.js';
import { geMondayCodeDomain } from './env-service.js';
import { ACCESS_TOKEN_NOT_FOUND } from '../consts/messages.js';
import { ErrorMondayCode } from '../types/errors/index.js';
import logger from '../utils/logger.js';
const DEFAULT_TIMEOUT = 10 * 1000;

export async function execute<T extends BASE_RESPONSE_HTTP_META_DATA>(params: EXECUTE_PARAMS): Promise<T> {
  const accessToken = ConfigService.getConfigDataByKey('accessToken');
  if (!accessToken) {
    Logger.error(ACCESS_TOKEN_NOT_FOUND);
    throw new Error(ACCESS_TOKEN_NOT_FOUND);
  }

  const { body: data, query, url, method, timeout } = params;
  const headers = { Accept: 'application/json', Authorization: accessToken };
  const baseURL = geMondayCodeDomain();
  try {
    const response = await axios.request<T>({
      method,
      baseURL,
      url,
      data,
      headers,
      params: query,
      timeout: timeout || DEFAULT_TIMEOUT,
    });
    return { ...response.data, statusCode: 200, headers: response.headers };
  } catch (error: any | Error | AxiosError) {
    logger.debug(error);
    const defaultErrorMessage = `Couldn't connect to the remote server "${baseURL}"`;
    if (error instanceof AxiosError) {
      const errorAxiosResponse = error.response?.data as BASE_ERROR_RESPONSE;
      const statusCode = error.response?.status;
      const title = errorAxiosResponse?.title;
      const message = errorAxiosResponse?.message || defaultErrorMessage;
      throw new ErrorMondayCode(message, title, statusCode);
    } else if (error instanceof Error) {
      const message = error.message || defaultErrorMessage;
      throw new ErrorMondayCode(message);
    } else {
      throw new ErrorMondayCode('An un known error occurred.');
    }
  }
}
