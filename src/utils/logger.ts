import chalk from 'chalk';

import {pinoLogger} from 'utils/prettifier-logger';

type ConsoleMethod = (...args: any[]) => void;
type ConsoleProperties = keyof Console & (typeof LOG_PROPS)[keyof typeof LOG_PROPS];
type Logger = typeof console & { success: typeof console.log };

const LOG_PROPS = {
  DEBUG: 'debug',
  ERROR: 'error',
  INFO: 'info',
  LOG: 'log',
  WARN: 'warn',
  TABLE: 'table',
  SUCCESS: 'success',
};
const LOG_PROPS_MAPPING = {
  [LOG_PROPS.SUCCESS]: LOG_PROPS.INFO,
};
const STANDARD_COLORS_MAPPING = {
  [LOG_PROPS.ERROR]: chalk.bold.red,
  [LOG_PROPS.WARN]: chalk.bold.yellow,
  [LOG_PROPS.INFO]: chalk.dim,
  [LOG_PROPS.SUCCESS]: chalk.bold.green,
};

let isDebugMode = false;

function emptyFunction() {
  return;
}

export function enableDebugMode() {
  isDebugMode = true;
}

const consoleHandler = {
  get: function (target: Console, property: ConsoleProperties, receiver: Console): ConsoleMethod | any {
    const mappedMethodProperty = LOG_PROPS_MAPPING[property] || property;
    const originalMethod = Reflect.get(target, mappedMethodProperty, receiver) as ConsoleMethod;

    if (!isDebugMode && property === LOG_PROPS.DEBUG) {
      return emptyFunction;
    }

     if (isDebugMode && property === LOG_PROPS.DEBUG) {
      return (...args: unknown[]) => {
        const isError = args[0] instanceof Error;
        if (isError) {
          pinoLogger.error(args[0]);
        } else {
          (pinoLogger.info as ConsoleMethod)(...args);
        }
      }
    }

    if (typeof originalMethod === 'function') {
      return (...args: unknown[]) => {
        const colorFunction = STANDARD_COLORS_MAPPING[property];
        let finalArguments = args;
        if (colorFunction) {
          finalArguments = args.map(arg => colorFunction(arg));
        }

        originalMethod(...finalArguments);
      };
    }
  },
};

const logger: Logger = new Proxy(console, consoleHandler) as Logger;

export default logger;
