import { AxiosResponse } from 'axios';
import pino from 'pino';
import pretty from 'pino-pretty';

const responseSerializer = (res: unknown) => {
  const response = res as AxiosResponse;
  if (!response.status || !response?.config?.method || !response?.config?.url) {
    return JSON.stringify(res);
  }

  return `${response.config.method.toUpperCase()}: ${response.config.url} - ${response.status}`;
};

const stream = pretty({
  colorize: true,
  ignore: 'err.config,pid,hostname',
  customPrettifiers: {
    res: responseSerializer,
  },
});

const logger = pino(stream);
logger.level = 'debug';

export const pinoLogger = logger;
