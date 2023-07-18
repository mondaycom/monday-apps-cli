import pino from 'pino';
import pretty from 'pino-pretty';

type Response = {
  status: number;
  config:  {
    url: string;
    method: string;
  }
};

const responseSerializer = (res: unknown) => {
  const response: Response = res as Response;
  return `${response.config.method.toUpperCase()}/${response.config.url} - ${response.status}`;
};

const stream = pretty({
  colorize: true,
  ignore: 'err.config,pid,hostname',
  customPrettifiers: {
    res: responseSerializer,
  },
});

export const pinoLogger = pino(stream);
