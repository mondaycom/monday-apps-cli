import {
  getStderr,
  getStdout,
  clearStderr,
  clearStdout,
  getConfigDataByKeySpy,
  processExistSpy,
} from './cli-test-utils';
import { enableDebugMode, default as logger } from 'utils/logger';

enableDebugMode();

global.beforeEach(() => {
  let stdout = getStdout();
  let stderr = getStderr();
  jest.spyOn(process.stdout, 'write').mockImplementation(stdoutValue => stdout.push(stdoutValue) > -1);
  jest.spyOn(process.stderr, 'write').mockImplementation(stderrValue => stderr.push(stderrValue) > -1);
  jest.spyOn(logger, 'error').mockImplementation(val => stderr.push(val as string) > -1);
  jest.spyOn(logger, 'log').mockImplementation(val => stdout.push(val as string) > -1);
  jest.spyOn(logger, 'info').mockImplementation(val => stdout.push(val as string) > -1);
  jest.spyOn(logger, 'warn').mockImplementation(val => stdout.push(val as string) > -1);
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
  getConfigDataByKeySpy.mockReset();
  processExistSpy.mockReset();
});

process.on('unhandledRejection', err => {
  console.log(err);
  throw new Error(
    "Got unhandled rejection (see above)! maybe you missed await on 'expect(..).rejects...' or 'expect(..).resolves...' ?",
  );
});
