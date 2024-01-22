import axios from 'axios';
import { ConfigService } from 'services/config-service';

let stdout: (string | Uint8Array | object)[] = [];
let stderr: (string | Uint8Array | object)[] = [];
let debugOutput: (string | Uint8Array | object)[] = [];

const axiosRequestSpy = jest.spyOn(axios, 'request');

export const getConfigDataByKeySpy = jest.spyOn(ConfigService, 'getConfigDataByKey');

export const processExistSpy = jest.spyOn(process, 'exit');

export function getRawStdout() {
  return stdout;
}

export function getRawStderr() {
  return stderr;
}

export function getRawDebugOutput() {
  return debugOutput;
}

export function clearDebugOutput() {
  debugOutput = [];
}

export function clearStdout() {
  stdout = [];
}

export function clearStderr() {
  stderr = [];
}

function joinOutputArray(arr: (string | Uint8Array | object)[]) {
  return arr.map(val => (typeof val === 'string' ? val : JSON.stringify(val))).join('');
}

export function getStdout() {
  return joinOutputArray(stdout);
}

export function getStderr() {
  return joinOutputArray(stderr);
}

export function getDebugOutput() {
  return joinOutputArray(debugOutput);
}

export function mockRequestResolvedValueOnce(response: unknown, responseHeaders?: Record<string, string>) {
  const headers = responseHeaders || {};
  const enrichedResponse = { data: response, headers };
  axiosRequestSpy.mockResolvedValueOnce(enrichedResponse);
}

export function resetRequestSpy() {
  axiosRequestSpy.mockReset();
}

export function getRequestSpy() {
  return axiosRequestSpy;
}
