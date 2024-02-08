import AppCreate from 'commands/app/create';
import { APP_VERSION_STATUS } from 'consts/app-versions';
import {
  createAppUrl,
  getCreateAppFeatureReleaseUrl,
  getCreateAppFeatureUrl,
  getTunnelingDomainUrl,
  listAppVersionsByAppIdUrl,
} from 'consts/urls';
import { buildMockFlags, getRequestSpy, getStdout, mockListPromptImplementation } from 'test/cli-test-utils';

const requestSpy = getRequestSpy();

describe('app:create', () => {
  jest.setTimeout(1_000_000);
  const MOCK_BASE_RESPONSE = { headers: {} };
  const MOCK_APP_ID = 1_000_000_001;
  const MOCK_APP_VERSION_ID = 1_000_000_002;
  const MOCK_APP_FEATURE_ID = 1_000_000_003;
  const question = 'Select a template to start with';
  const answer = 'Fullstack React + Node.js (TypeScript)';

  const mockAppCreateResponse = {
    app: {
      id: MOCK_APP_ID,
      name: 'New App by CLI',
    },
  };

  const mockAppVersionsResponse = {
    appVersions: [
      {
        id: MOCK_APP_VERSION_ID,
        name: 'v1.0.0',
        versionNumber: '1.0.0',
        appId: MOCK_APP_ID,
        status: APP_VERSION_STATUS.DRAFT,
      },
    ],
  };

  const mockAppFeaturesResponse = {
    app_feature: {
      id: MOCK_APP_FEATURE_ID,
      appVersionId: MOCK_APP_VERSION_ID,
      type: 'web',
      name: 'New Feature',
      state: 'active',
    },
  };

  const mockAppFeatureBuildResponse = {
    app_feature: {
      id: MOCK_APP_FEATURE_ID,
      appVersionId: MOCK_APP_VERSION_ID,
      type: 'web',
      name: 'New Feature',
      state: 'active',
    },
  };

  const mockTunnelingDomainResponse = {
    domain: 'abcdefgh.monday.mock',
  };

  it('should create app successfully', async () => {
    const mockPushFlags = buildMockFlags(AppCreate, { name: 'New App by CLI' });
    mockListPromptImplementation([{ question, answer }]);

    requestSpy.mockImplementation(async config => {
      if (config.url!.endsWith(createAppUrl())) {
        return { data: mockAppCreateResponse, ...MOCK_BASE_RESPONSE };
      }

      if (config.url!.endsWith(getTunnelingDomainUrl())) {
        return { data: mockTunnelingDomainResponse, ...MOCK_BASE_RESPONSE };
      }

      if (config.url!.endsWith(listAppVersionsByAppIdUrl(mockAppCreateResponse.app.id))) {
        console.log('listAppVersionsByAppIdUrl mocked');
        return { data: mockAppVersionsResponse, ...MOCK_BASE_RESPONSE };
      }

      if (
        config.url!.endsWith(
          getCreateAppFeatureUrl(mockAppCreateResponse.app.id, mockAppVersionsResponse.appVersions[0].id),
        )
      ) {
        return { data: mockAppFeaturesResponse, ...MOCK_BASE_RESPONSE };
      }

      if (
        config.url!.endsWith(
          getCreateAppFeatureReleaseUrl(
            mockAppCreateResponse.app.id,
            mockAppFeaturesResponse.app_feature.appVersionId,
            mockAppFeaturesResponse.app_feature.id,
          ),
        )
      ) {
        return { data: mockAppFeatureBuildResponse, ...MOCK_BASE_RESPONSE };
      }
    });
    await AppCreate.run(mockPushFlags);
    const stdout = getStdout();
    expect(stdout).toContain('Your app is ready');
    expect(stdout).toContain("cd ./quickstart-fullstack-react-node' to see your app files.");
    expect(stdout).toContain(
      `open in browser: http://monday.llama.fan/apps/manage/${MOCK_APP_ID}/app_versions/${MOCK_APP_VERSION_ID}/sections/appDetails to manage your app`,
    );
  });
});
