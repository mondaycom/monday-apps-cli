import { pinoLogger } from 'utils/prettifier-logger';

type MethodConsole = (...args: unknown[]) => void;

let isDebugMode = false;

class Logger {
  info = (...args: unknown[]) => (pinoLogger.info as MethodConsole)(...args);

  error = (...args: unknown[]) => (pinoLogger.error as MethodConsole)(...args);

  warn = (...args: unknown[]) => (pinoLogger.warn as MethodConsole)(...args);

  log = (...args: unknown[]) => (pinoLogger.info as MethodConsole)(...args);

  success = (...args: unknown[]) => (pinoLogger.info as MethodConsole)(...args);

  debug(...args: unknown[]): void {
    if (!isDebugMode) {
      return;
    }

    const obj: unknown = args[0];
    const isError = obj instanceof Error;
    if (isError) {
      this.error(...args);
    } else {
      this.info(...args);
    }
  }

  table = (...args: unknown[]) => (console.table as MethodConsole)(...args);
}

export function enableDebugMode() {
  isDebugMode = true;
}

const logger: Logger = new Logger();

export default logger;
