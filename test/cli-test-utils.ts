import { Command, Config } from '@oclif/core';
import axios from 'axios';
import { ConfigService } from 'services/config-service';
import { PromptService } from 'services/prompt-service';
import { isDefined } from 'src/utils/validations';

const ANSI_REGEX = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

let debugOutput: (string | Uint8Array | object)[] = [];

const axiosRequestSpy = jest.spyOn(axios, 'request');

export const getConfigDataByKeySpy = jest.spyOn(ConfigService, 'getConfigDataByKey');
export const processExistSpy = jest.spyOn(process, 'exit');
export const stdoutWriteSpy = jest.spyOn(process.stdout, 'write');
export const stderrWriteSpy = jest.spyOn(process.stderr, 'write');

const promptSelectionWithAutoCompleteSpy = jest.spyOn(PromptService, 'promptSelectionWithAutoComplete');
const promptListSpy = jest.spyOn(PromptService, 'promptList');

function joinOutputArray(arr: (string | Uint8Array | object)[]) {
  return arr.map(val => (typeof val === 'string' ? val : JSON.stringify(val))).join('');
}

const stripAnsi = (str: string) => str.replace(ANSI_REGEX, '');

export function getStdout() {
  const stdoutArgs = stdoutWriteSpy.mock.calls.map(args => args[0]);
  return stripAnsi(joinOutputArray(stdoutArgs));
}

export function getStderr() {
  const stderrArgs = stderrWriteSpy.mock.calls.map(args => args[0]);
  return stripAnsi(joinOutputArray(stderrArgs));
}

export function getDebugOutput() {
  return joinOutputArray(debugOutput);
}

export function mockRequestResolvedValueOnce(response: unknown, responseHeaders?: Record<string, string>) {
  const headers = responseHeaders || {};
  const enrichedResponse = { data: response, headers };
  axiosRequestSpy.mockResolvedValueOnce(enrichedResponse);
}

export function mockSelectionWithAutoCompleteImplementation(prompts: Array<{ answer: string; question: string }>) {
  promptSelectionWithAutoCompleteSpy.mockImplementation(async (message: string, _choices: string[]) => {
    const selectedPrompt = prompts.find(({ answer, question }) => message.includes(question));

    if (!selectedPrompt) {
      throw new Error('Unexpected message');
    }

    return selectedPrompt.answer;
  });
}

export function mockListPromptImplementation(prompts: Array<{ answer: string; question: string }>) {
  promptListSpy.mockImplementation(async (message: string, _choices: string[]) => {
    const selectedPrompt = prompts.find(({ answer, question }) => message.includes(question));

    if (!selectedPrompt) {
      throw new Error('Unexpected message');
    }

    return selectedPrompt.answer;
  });
}

export function resetMockListPromptImplementation() {
  promptListSpy.mockReset();
}

export function resetMockSelectionWithAutoCompleteImplementation() {
  promptSelectionWithAutoCompleteSpy.mockReset();
}

export function resetRequestSpy() {
  axiosRequestSpy.mockReset();
}

export function getRequestSpy() {
  return axiosRequestSpy;
}

export const buildMockFlags = <T extends typeof Command>(
  command: T,
  flagsMap: Partial<Record<keyof T['flags'], string | number>>,
): Array<string> => {
  return Object.entries(flagsMap).flatMap(([flagName, value]) => buildMockFlag(command, flagName, value));
};

export const buildMockFlag = <T extends typeof Command>(
  command: T,
  flagName: keyof T['flags'],
  value?: string | number,
): Array<string> => {
  const mockedFlag = [`-${command.flags[flagName].char}`];
  if (isDefined(value)) {
    mockedFlag.push(value.toString());
  }

  return mockedFlag;
};

export const createMockConfig = (): Config => {
  return {
    bin: 'mapps',
    configDir: process.cwd(),
    runCommand: jest.fn(),
  } as unknown as Config;
};