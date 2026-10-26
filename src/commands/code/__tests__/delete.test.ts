import { AxiosError, AxiosHeaders } from 'axios';

import CodeDelete from 'commands/code/delete';
import { appDeploymentsUrl } from 'consts/urls';
import { PromptService } from 'services/prompt-service';
import {
  buildMockFlags,
  createMockConfig,
  getRequestSpy,
  getStderr,
  getStdout,
  resetRequestSpy,
} from 'test/cli-test-utils';

const requestSpy = getRequestSpy();
const promptConfirmSpy = jest.spyOn(PromptService, 'promptConfirm');

const buildHttpError = (status: number, message: string) =>
  new AxiosError(message, String(status), undefined, undefined, {
    status,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: { message },
  });

const runCommand = async (flags: Partial<Record<keyof typeof CodeDelete.flags, number>>, extraArgs: string[] = []) => {
  const command = new CodeDelete([...buildMockFlags(CodeDelete, flags), ...extraArgs], createMockConfig());
  await command.run();
};

describe('code:delete', () => {
  const MOCK_APP_ID = 1_000_000_001;

  afterEach(() => {
    resetRequestSpy();
    promptConfirmSpy.mockReset();
  });

  it('should delete the deployments after confirmation', async () => {
    promptConfirmSpy.mockResolvedValue(true);
    requestSpy.mockResolvedValueOnce({ data: {}, headers: {} });

    await runCommand({ appId: MOCK_APP_ID });

    const [requestConfig] = requestSpy.mock.calls[0];
    expect(requestConfig.method).toBe('delete');
    expect(requestConfig.url).toContain(appDeploymentsUrl(MOCK_APP_ID));
    expect(getStdout()).toContain(`Deleting the monday-code deployments of app ${MOCK_APP_ID}`);
  });

  it('should not delete the deployments when the confirmation is declined', async () => {
    promptConfirmSpy.mockResolvedValue(false);

    await runCommand({ appId: MOCK_APP_ID });

    expect(requestSpy).not.toHaveBeenCalled();
    expect(getStdout()).toContain('Deletion cancelled');
  });

  it('should skip the confirmation with the force flag', async () => {
    requestSpy.mockResolvedValueOnce({ data: {}, headers: {} });

    await runCommand({ appId: MOCK_APP_ID }, ['-f']);

    expect(promptConfirmSpy).not.toHaveBeenCalled();
    expect(requestSpy).toHaveBeenCalledTimes(1);
  });

  it('should print an error when the app has no monday-code deployment', async () => {
    promptConfirmSpy.mockResolvedValue(true);
    requestSpy.mockRejectedValueOnce(buildHttpError(404, 'No monday code deployment found for this app'));

    await expect(runCommand({ appId: MOCK_APP_ID })).rejects.toThrow('process.exit(1)');

    expect(getStderr()).toContain(`No monday-code deployment found for app id - "${MOCK_APP_ID}"`);
  });

  it('should print the server message when a deployment is ongoing', async () => {
    promptConfirmSpy.mockResolvedValue(true);
    requestSpy.mockRejectedValueOnce(buildHttpError(400, 'monday code deployments are still ongoing'));

    await expect(runCommand({ appId: MOCK_APP_ID })).rejects.toThrow('process.exit(1)');

    expect(getStderr()).toContain('monday code deployments are still ongoing');
  });
});
