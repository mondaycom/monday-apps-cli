import { getConfigDataByKeySpy, processExistSpy, stderrWriteSpy, stdoutWriteSpy } from './cli-test-utils';
import { enableDebugMode, default as logger } from 'utils/logger';

enableDebugMode();

function addLoggerSpies() {
  jest.spyOn(logger, 'error').mockImplementation(val => console.error(val as string));
  jest.spyOn(logger, 'log').mockImplementation(val => console.log(val as string));
  jest.spyOn(logger, 'info').mockImplementation(val => console.info(val as string));
  jest.spyOn(logger, 'warn').mockImplementation(val => console.warn(val as string));
  jest.spyOn(logger, 'table').mockImplementation(val => console.table(val as string));
  jest.spyOn(logger, 'success').mockImplementation(val => console.info(val as string));
  jest.spyOn(logger, 'debug').mockImplementation(val => {
    if (val instanceof Error) {
      return console.error(val);
    }

    console.debug(val as string);
  });
}

global.beforeEach(() => {
  addLoggerSpies();
  getConfigDataByKeySpy.mockReturnValue('mocked-access-token');
  // @ts-ignore
  processExistSpy.mockImplementation(code => {
    if (code !== 0) {
      throw new Error(`process.exit(${code})`);
    }
  });
});

global.afterEach(() => {
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
