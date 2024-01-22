import {
  getRawStderr,
  getRawStdout,
  clearStderr,
  clearStdout,
  getConfigDataByKeySpy,
  processExistSpy,
  clearDebugOutput,
  getRawDebugOutput,
} from './cli-test-utils';
import { enableDebugMode, default as logger } from 'utils/logger';

enableDebugMode();

function addLoggerSpies() {
  let stdout = getRawStdout();
  let stderr = getRawStderr();
  const debugOutput = getRawDebugOutput();
  jest.spyOn(logger, 'error').mockImplementation(val => stderr.push(val as string));
  jest.spyOn(logger, 'log').mockImplementation(val => stdout.push(val as string));
  jest.spyOn(logger, 'info').mockImplementation(val => stdout.push(val as string));
  jest.spyOn(logger, 'warn').mockImplementation(val => stdout.push(val as string));
  jest.spyOn(logger, 'table').mockImplementation(val => stdout.push(val as string));
  jest.spyOn(logger, 'success').mockImplementation(val => stdout.push(val as string));
  jest.spyOn(logger, 'debug').mockImplementation(val => debugOutput.push(val as string));
}

function AddStderrSpy() {
  let stderr = getRawStderr();
  jest.spyOn(process.stderr, 'write').mockImplementation(stderrValue => stderr.push(stderrValue) > -1);
}

global.beforeEach(() => {
  AddStderrSpy();
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
  clearStderr();
  clearStdout();
  clearDebugOutput();
  getConfigDataByKeySpy.mockReset();
  processExistSpy.mockReset();
});

process.on('unhandledRejection', err => {
  console.log(err);
  throw new Error(
    "Got unhandled rejection (see above)! maybe you missed await on 'expect(..).rejects...' or 'expect(..).resolves...' ?",
  );
});
