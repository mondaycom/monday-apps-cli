// eslint-disable-next-line node/no-extraneous-import,n/no-extraneous-import
import { describe, expect, it, jest } from '@jest/globals';

import { APP_VERSION_STATUS } from 'consts/app-versions';
import * as appVersionService from 'services/app-versions-service';

const appId = 1;

const appWithDraftsVersions = [
  {
    id: 1,
    name: 'name',
    versionNumber: 'versionNumber',
    appId: appId,
    status: APP_VERSION_STATUS.DRAFT,
  },
  {
    id: 2,
    name: 'name',
    versionNumber: 'versionNumber',
    appId: appId,
    status: APP_VERSION_STATUS.DRAFT,
  },
];

const appWithLiveVersion = [
  {
    id: 1,
    name: 'name',
    versionNumber: 'versionNumber',
    appId: appId,
    status: APP_VERSION_STATUS.LIVE,
  },
];

const mockedListAppVersionsByAppId = jest.spyOn(appVersionService, 'listAppVersionsByAppId');

describe('AppVersionsService', () => {
  describe('defaultVersionByAppId', () => {
    it('should return the latest draft version for the app', async () => {
      mockedListAppVersionsByAppId.mockResolvedValue(appWithDraftsVersions);
      const defaultVersion = await appVersionService.defaultVersionByAppId(appId);
      expect(defaultVersion?.id).toEqual(2);
    });

    it('should return the latest draft version for the app', async () => {
      mockedListAppVersionsByAppId.mockResolvedValue(appWithLiveVersion);
      const defaultVersion = await appVersionService.defaultVersionByAppId(appId);
      expect(defaultVersion?.id).not.toBeDefined();
    });
  });
});
