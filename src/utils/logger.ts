import { pinoLogger } from 'utils/prettifier-logger';

type ConsoleMethod = (...args: any[]) => void;

class Logger {
  info(...args: unknown[]): void {
    (pinoLogger.info as ConsoleMethod)(...args);
  }

  error(...args: unknown[]): void {
      pinoLogger.error(args[0]);
  }

  warn(...args: unknown[]): void {
    (pinoLogger.warn as ConsoleMethod)(...args);
  }

  debug(...args: unknown[]): void {
    if (!isDebugMode) {
      return;
    }

    const isError = args[0] instanceof Error;
    if (isError) {
      pinoLogger.error(args[0]);
    } else {
      this.info(...args);
    }
  }

  log(...args: unknown[]): void {
    (pinoLogger.info as ConsoleMethod)(...args);
  }

  success(...args: unknown[]): void {
    (pinoLogger.info as ConsoleMethod)(...args);
  }

  table(...args: unknown[]): void {
    (console.table as ConsoleMethod)(...args);
  }
}

let isDebugMode = false;

export function enableDebugMode() {
  isDebugMode = true;
}

const logger: Logger = new Logger();

export default logger;
