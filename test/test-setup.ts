import { getConfigDataByKeySpy, processExistSpy, stderrWriteSpy, stdoutWriteSpy } from './cli-test-utils';
import { enableDebugMode, default as logger } from 'utils/logger';

enableDebugMode();

// Store logger spies so they can be properly cleaned up
let loggerSpies: jest.SpyInstance[] = [];

function addLoggerSpies() {
  // Restore and clear any existing spies first
  loggerSpies.forEach(spy => {
    spy.mockRestore();
  });
  loggerSpies = [];

  // Create new spies that write to process.stdout/stderr so they can be captured
  loggerSpies.push(
    jest.spyOn(logger, 'error').mockImplementation(val => process.stderr.write(val as string + '\n')),
    jest.spyOn(logger, 'log').mockImplementation(val => process.stdout.write(val as string + '\n')),
    jest.spyOn(logger, 'info').mockImplementation(val => process.stdout.write(val as string + '\n')),
    jest.spyOn(logger, 'warn').mockImplementation(val => process.stderr.write(val as string + '\n')),
    jest.spyOn(logger, 'table').mockImplementation(val => process.stdout.write(JSON.stringify(val) as string + '\n')),
    jest.spyOn(logger, 'success').mockImplementation(val => process.stdout.write(val as string + '\n')),
    jest.spyOn(logger, 'debug').mockImplementation(val => {
      if (val instanceof Error) {
        return process.stderr.write(val.toString() + '\n');
      }

      process.stderr.write(val as string + '\n');
    }),
  );
}

global.beforeEach(() => {
  addLoggerSpies();
  getConfigDataByKeySpy.mockReturnValue('mocked-access-token');
  // @ts-ignore
  processExistSpy.mockImplementation((code) => {
    if (code !== 0) {
      throw new Error(`process.exit(${code})`);
    }
    // Return undefined to prevent actual process exit
    return undefined as never;
  });
});

global.afterEach(() => {
  // Clear all spies
  loggerSpies.forEach(spy => spy.mockClear());
  
  getConfigDataByKeySpy.mockClear();
  processExistSpy.mockClear();
  stderrWriteSpy.mockClear();
  stdoutWriteSpy.mockClear();
});

process.on('unhandledRejection', err => {
  console.log(err);
  throw new Error(
    "Got unhandled rejection (see above)! maybe you missed await on 'expect(..).rejects...' or 'expect(..).resolves...' ?",
  );
});
