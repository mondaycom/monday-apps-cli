// eslint-disable-next-line node/no-extraneous-import,n/no-extraneous-import
import { describe, expect, it, jest } from '@jest/globals';
import axios, { AxiosError, AxiosResponse } from 'axios';

import { execute } from 'services/api-service';
import { HttpError } from 'types/errors';
import { HttpMethodTypes } from 'types/services/api-service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('services/config-service', () => ({
  ConfigService: {
    getConfigDataByKey: jest.fn().mockReturnValue('fake-access-token'),
  },
}));

jest.mock('services/env-service', () => ({
  getAppsDomain: jest.fn().mockReturnValue('https://api.monday.com'),
}));

describe('ApiService', () => {
  it('should throw HttpError with helpful token message for invalid token', async () => {
    const mockResponse = {
      status: 406,
      data: {},
      statusText: 'Not Acceptable',
      headers: {},
    } as AxiosResponse;

    const axiosError = new AxiosError('Request failed');
    axiosError.response = mockResponse;

    mockedAxios.request.mockRejectedValue(axiosError);

    const error = (await execute({
      url: '/test',
      method: HttpMethodTypes.GET,
    }).catch((error_: Error) => error_)) as HttpError;

    expect(error).toBeInstanceOf(HttpError);
    expect(error.message).toEqual(
      'Invalid or expired access token.\n\n' +
        'To fix this, run:\n' +
        '   mapps init -t YOUR_ACCESS_TOKEN\n\n' +
        'Or run: mapps init\n' +
        '(and you will be prompted for your token)\n\n',
    );
  });
});
