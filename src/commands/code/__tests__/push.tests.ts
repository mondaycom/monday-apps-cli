import fs from 'node:fs';
import nodeTimersPromises from 'node:timers/promises';

import CodePush from 'commands/code/push';
import { getAppVersionDeploymentStatusUrl, getDeploymentSignedUrl } from 'consts/urls';
import * as filesService from 'services/files-service';
import { PromptService } from 'services/prompt-service';
import { buildMockFlags, getRequestSpy, getStdout, resetRequestSpy } from 'test/cli-test-utils';
import { DeploymentStatusTypesSchema } from 'types/services/push-service';

const promptSelectionWithAutoCompleteSpy = jest.spyOn(PromptService, 'promptSelectionWithAutoComplete');
const createTarGzArchiveSpy = jest.spyOn(filesService, 'createTarGzArchive');
const fsReadFileSpy = jest.spyOn(fs, 'readFileSync');
const fsExistsSpy = jest.spyOn(fs, 'existsSync');
const requestSpy = getRequestSpy();

const advanceDeploymentStatusResponse = (
  deploymentStatusFlow: Record<string, keyof Partial<typeof DeploymentStatusTypesSchema>>,
  currentStatus: keyof Partial<typeof DeploymentStatusTypesSchema> | 'undefined',
  mockDeploymentUrl: string,
) => {
  const status = deploymentStatusFlow[currentStatus];
  const deployment =
    status === DeploymentStatusTypesSchema.successful
      ? { url: mockDeploymentUrl, latestUrl: mockDeploymentUrl }
      : undefined;

  return {
    data: { status, ...(deployment && { deployment }) },
    headers: {},
  };
};

describe('code:push', () => {
  const MOCK_APP_VERSION_ID = 10;
  const MOCK_DIRECTORY_PATH = 'mockDirectory';
  const MOCK_SIGNED_STORAGE_URL = 'mockSignedStorageUrl';
  const MOCK_BASE_RESPONSE = { headers: {} };
  const MOCK_EMPTY_SERVER_RESPONSE = { data: {}, headers: {} };

  beforeEach(() => {
    promptSelectionWithAutoCompleteSpy.mockImplementation(async (message: string, _choices: string[]) => {
      if (message.includes('Select an app')) {
        return 'mockAppId';
      }

      if (message.includes('Select an app version')) {
        return 'mockAppVersionId';
      }

      throw new Error('Unexpected message');
    });
    fsExistsSpy.mockReturnValue(true);
    fsReadFileSpy.mockImplementation(() => JSON.stringify({}));
    createTarGzArchiveSpy.mockResolvedValue('mockTarGzArchive');
    jest.useFakeTimers();
    jest.spyOn(nodeTimersPromises, 'setTimeout').mockImplementation(async (_ms: number | undefined) => ({}));
  });

  afterEach(() => {
    promptSelectionWithAutoCompleteSpy.mockReset();
    fsExistsSpy.mockReset();
    fsReadFileSpy.mockReset();
    createTarGzArchiveSpy.mockReset();
    resetRequestSpy();
  });

  it('Push should work', async () => {
    const deployStepsFlow = {
      undefined: DeploymentStatusTypesSchema.started,
      [DeploymentStatusTypesSchema.started]: DeploymentStatusTypesSchema.pending,
      [DeploymentStatusTypesSchema.pending]: DeploymentStatusTypesSchema.building,
      [DeploymentStatusTypesSchema.building]: DeploymentStatusTypesSchema['building-infra'],
      [DeploymentStatusTypesSchema['building-infra']]: DeploymentStatusTypesSchema['building-app'],
      [DeploymentStatusTypesSchema['building-app']]: DeploymentStatusTypesSchema['deploying-app'],
      [DeploymentStatusTypesSchema['deploying-app']]: DeploymentStatusTypesSchema.successful,
      [DeploymentStatusTypesSchema.successful]: DeploymentStatusTypesSchema.successful,
    };

    const mockDeploymentUrl = 'mockDeploymentUrl';
    let currentDeployStep: keyof Partial<typeof DeploymentStatusTypesSchema> | 'undefined' = 'undefined';

    requestSpy.mockImplementation(async config => {
      if (config.url!.includes(getDeploymentSignedUrl(MOCK_APP_VERSION_ID))) {
        return { data: { signed: MOCK_SIGNED_STORAGE_URL }, ...MOCK_BASE_RESPONSE };
      }

      if (config.url!.includes(MOCK_SIGNED_STORAGE_URL)) {
        return MOCK_EMPTY_SERVER_RESPONSE;
      }

      if (config.url!.includes(getAppVersionDeploymentStatusUrl(MOCK_APP_VERSION_ID))) {
        const response = advanceDeploymentStatusResponse(deployStepsFlow, currentDeployStep, mockDeploymentUrl);
        currentDeployStep = response.data.status as keyof Partial<typeof DeploymentStatusTypesSchema>;
        return response;
      }
    });

    const mockPushFlags = buildMockFlags(CodePush, {
      appVersionId: MOCK_APP_VERSION_ID,
      directoryPath: MOCK_DIRECTORY_PATH,
    });
    await CodePush.run(mockPushFlags);
    const stdout = getStdout();
    expect(stdout).toContain(`██████████████████████████████████████░░░░░░░░░░░░ 75%`);
    expect(stdout).toContain(`Deployment successfully finished, deployment url: ${mockDeploymentUrl}`);
  });
});
