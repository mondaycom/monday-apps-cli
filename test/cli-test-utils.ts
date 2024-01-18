import axios from 'axios';
import { ConfigService } from 'services/config-service';

let stdout: (string | Uint8Array)[] = [];
let stderr: (string | Uint8Array)[] = [];

const axiosRequestSpy = jest.spyOn(axios, 'request');

export const getConfigDataByKeySpy = jest.spyOn(ConfigService, 'getConfigDataByKey');

export const processExistSpy = jest.spyOn(process, 'exit');

export function getStdout() {
  return stdout;
}

export function getStderr() {
  return stderr;
}

export function clearStdout() {
  stdout = [];
}

export function clearStderr() {
  stderr = [];
}

function joinOutputArray(arr: (string | Uint8Array)[]) {
  return arr.map(val => (typeof val === 'string' ? val : val.toString())).join('');
}

export function getJoinedStdout() {
  return joinOutputArray(stdout);
}

export function getJoinedStderr() {
  return joinOutputArray(stderr);
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
