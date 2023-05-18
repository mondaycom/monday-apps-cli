import crypto from 'node:crypto';
import https from 'node:https';

import axios, { AxiosError } from 'axios';
import { ZodObject } from 'zod/lib/types';

import { ACCESS_TOKEN_NOT_FOUND } from 'consts/messages';
import { ConfigService } from 'services/config-service.js';
import { getAppsDomain } from 'services/env-service.js';
import { ErrorMondayCode } from 'types/errors';
import { BaseErrorResponse, BaseResponseHttpMetaData, ExecuteParams } from 'types/services/monday-code-service';
import logger from 'utils/logger';

const DEFAULT_TIMEOUT = 10 * 1000;

export async function execute<T extends BaseResponseHttpMetaData>(
  params: ExecuteParams,
  schemaValidator?: ZodObject<any>,
): Promise<T> {
  const accessToken = ConfigService.getConfigDataByKey('accessToken');
  if (!accessToken) {
    logger.error(ACCESS_TOKEN_NOT_FOUND);
    throw new Error(ACCESS_TOKEN_NOT_FOUND);
  }

  const { body: data, query, url, method, timeout, headers } = params;
  const headersWithToken = { ...headers, Authorization: accessToken };
  const baseURL = getAppsDomain();
  try {
    const httpsAgent = new https.Agent({
      secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
      rejectUnauthorized: false,
    });
    const response = await axios.request<T>({
      httpsAgent,
      method,
      baseURL,
      url,
      data,
      headers: headersWithToken,
      params: query,
      timeout: timeout || DEFAULT_TIMEOUT,
    });
    const result = { ...response.data, statusCode: 200, headers: response.headers };
    return (schemaValidator && (schemaValidator.parse(result) as T)) || result;
  } catch (error: any | Error | AxiosError) {
    logger.debug(error);
    const defaultErrorMessage = `Couldn't connect to the remote server "${baseURL}"`;
    if (error instanceof AxiosError) {
      const errorAxiosResponse = error.response?.data as BaseErrorResponse;
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
