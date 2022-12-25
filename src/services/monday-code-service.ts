import axios from 'axios';
import {ExecuteParams} from '../types/services/monday-code-service.js'
import {ConfigService} from './config-service.js';
import Logger from '../utils/logger.js';
import {geMondayCodeDomain} from './env-service.js';
import {accessTokenNotFound} from '../consts/access-token-messages.js';
const DEFAULT_TIMEOUT = 10 * 1000;

export async function execute<T>(params: ExecuteParams): Promise<T> {
  const accessToken = ConfigService.getConfigDataByKey('accessToken');
  if (!accessToken) {
    Logger.error(accessTokenNotFound);
    throw new Error(accessTokenNotFound)
  }

  const { body: data, query, url, method, timeout } = params;
  const headers = { Accept: 'application/json', Authorization: accessToken }
  const baseURL = geMondayCodeDomain()
  const response = await axios.request<T>({
    method,
    baseURL,
    url,
    data,
    headers,
    params: query,
    timeout: timeout || DEFAULT_TIMEOUT,
  });
  return response.data
}
