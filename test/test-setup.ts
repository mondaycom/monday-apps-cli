import { getConfigDataByKeySpy, processExistSpy, stderrWriteSpy, stdoutWriteSpy } from './cli-test-utils';
import { enableDebugMode, default as logger } from 'utils/logger';

enableDebugMode();

// Store logger spies so they can be properly cleaned up
let loggerSpies: jest.SpyInstance[] = [];

function addLoggerSpies() {
  // Clear any existing spies first
  loggerSpies.forEach(spy => spy.mockRestore());
  loggerSpies = [];

  // Create new spies
  loggerSpies.push(
    jest.spyOn(logger, 'error').mockImplementation(val => console.error(val as string)),
    jest.spyOn(logger, 'log').mockImplementation(val => console.log(val as string)),
    jest.spyOn(logger, 'info').mockImplementation(val => console.info(val as string)),
    jest.spyOn(logger, 'warn').mockImplementation(val => console.warn(val as string)),
    jest.spyOn(logger, 'table').mockImplementation((val: unknown) => {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
        const headers = Object.keys(val[0] as Record<string, unknown>).join('\t');
        const rows = val.map(row =>
          Object.values(row as Record<string, unknown>)
            .map(value => (value === undefined ? '' : String(value)))
            .join('\t'),
        );
        console.log([headers, ...rows].join('\n'));
        return;
      }

      if (val && typeof val === 'object') {
        console.log(JSON.stringify(val));
        return;
      }

      console.log(String(val));
    }),
    jest.spyOn(logger, 'success').mockImplementation(val => console.info(val as string)),
    jest.spyOn(logger, 'debug').mockImplementation(val => {
      if (val instanceof Error) {
        return console.error(val);
      }

      console.debug(val as string);
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
  loggerSpies.forEach(spy => spy.mockRestore());
  loggerSpies = [];
  
  getConfigDataByKeySpy.mockReset();
  processExistSpy.mockReset();
  stderrWriteSpy.mockReset();
  stdoutWriteSpy.mockReset();
});

process.on('unhandledRejection', err => {
  console.log(err);
  throw new Error(
    "Got unhandled rejection (see above)! maybe you missed await on 'expect(..).rejects...' or 'expect(..).resolves...' ?",
  );
});
