// eslint-disable-next-line node/no-extraneous-import,n/no-extraneous-import
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import axios, { AxiosError } from 'axios';

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw HttpError with helpful token message for invalid token', async () => {
    const { execute } = await import('services/api-service');

    const axiosError = new AxiosError('Request failed');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    axiosError.response = {
      status: 406,
      data: {},
      statusText: 'Not Acceptable',
      headers: {},
      config: {},
    } as any;

    mockedAxios.request.mockRejectedValue(axiosError);

    await expect(
      execute({
        url: '/test',
        method: HttpMethodTypes.GET,
      }),
    ).rejects.toThrow('Invalid or expired access token');
  });
});
