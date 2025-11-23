import path from 'node:path';

import fs from 'fs-extra';

import AppCreate from 'commands/app/create';
import { APP_TEMPLATES_CONFIG } from 'consts/app-templates-config';
import { APP_VERSION_STATUS } from 'consts/app-versions';
import {
  createAppUrl,
  getCreateAppFeatureReleaseUrl,
  getCreateAppFeatureUrl,
  getTunnelingDomainUrl,
  listAppVersionsByAppIdUrl,
} from 'consts/urls';
import {
  buildMockFlags,
  createMockConfig,
  getRequestSpy,
  getStdout,
  mockSelectionWithAutoCompleteImplementation,
  resetMockSelectionWithAutoCompleteImplementation,
} from 'test/cli-test-utils';
import { getLastParam } from 'utils/urls-builder';

const requestSpy = getRequestSpy();

describe('app:create', () => {
  jest.setTimeout(1_000_000);
  const MOCK_BASE_RESPONSE = { headers: {} };
  const MOCK_APP_ID = 1_000_000_001;
  const MOCK_APP_VERSION_ID = 1_000_000_002;
  const MOCK_APP_FEATURE_ID = 1_000_000_003;

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
    // eslint-disable-next-line camelcase
    app_feature: {
      id: MOCK_APP_FEATURE_ID,
      appVersionId: MOCK_APP_VERSION_ID,
      type: 'web',
      name: 'New Feature',
      state: 'active',
    },
  };

  const mockAppFeatureBuildResponse = {
    // eslint-disable-next-line camelcase
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

  afterEach(() => {
    resetMockSelectionWithAutoCompleteImplementation();
  });

  it('should create app successfully', async () => {
    const question = 'Select a template to start with';
    const selectedTemplate = APP_TEMPLATES_CONFIG[0];
    const answer = selectedTemplate.name;

    const config = createMockConfig();
    const mockPushFlags = buildMockFlags(AppCreate, { name: 'New App by CLI' });
    mockSelectionWithAutoCompleteImplementation([{ question, answer }]);

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

    try {
      const command = new AppCreate(mockPushFlags, config);
      await command.run();

      const stdout = getStdout();
      expect(stdout).toContain('✔ Downloading template');
      expect(stdout).toContain('✔ Creating app');
      expect(stdout).toContain('✔ Creating features');
      expect(stdout).toContain(`'cd ${getLastParam(selectedTemplate.folder)}' to see your app files.`);
    } finally {
      // Clean up the template directory after the test
      const templatePath = path.join(process.cwd(), getLastParam(selectedTemplate.folder));
      if (fs.existsSync(templatePath)) {
        await fs.remove(templatePath);
      }
    }
  });
});
