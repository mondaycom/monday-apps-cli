// eslint-disable-next-line node/no-extraneous-import,n/no-extraneous-import
import { describe, expect, it } from '@jest/globals';

import { readManifestFile } from 'services/manifest-service';

describe('ManifestService', () => {
  describe('readManifestFile', () => {
    it('should read manifest file', () => {
      const manifest = readManifestFile('src/services/__tests__/mocks/', 'manifest-mock.yml');
      expect(manifest?.app?.id).toEqual(undefined);
      expect(manifest?.app?.hosting?.cdn?.path).toEqual('./build');
      expect(manifest?.app?.hosting?.server?.path).toEqual('./server');
      expect(manifest?.version).toEqual('1.0.0');
    });
  });
});
