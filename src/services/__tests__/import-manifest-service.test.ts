import type { ListrTaskWrapper } from 'listr2';

import { execute } from 'services/api-service';
import { compressFilesToZip, readZipFileAsBuffer } from 'services/files-service';
import * as importManifestService from 'services/import-manifest-service';
import { processManifestTemplate, uploadManifestTsk } from 'services/import-manifest-service';
import type { ImportCommandTasksContext } from 'types/commands/manifest-import';
import { loadFile, saveToFile, unlink } from 'utils/file-system';

jest.mock('services/api-service', () => ({
  execute: jest.fn().mockResolvedValue({}),
}));

jest.mock('services/files-service', () => ({
  compressFilesToZip: jest.fn(),
  readZipFileAsBuffer: jest.fn(),
}));

jest.mock('utils/file-system', () => ({
  loadFile: jest.fn(),
  saveToFile: jest.fn(),
  unlink: jest.fn(),
}));

describe('processManifestTemplate', () => {
  const mockLoadFile = loadFile as jest.MockedFunction<typeof loadFile>;
  const mockPath = 'path/to/manifest.json';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process valid manifest with environment variables', async () => {
    process.env.TEST_VAR = 'test-value';
    mockLoadFile.mockResolvedValue('{"key": "{{TEST_VAR}}"}');

    const result = await processManifestTemplate(mockPath);
    expect(result).toEqual({ key: 'test-value' });
  });

  it('should throw TypeError for invalid JSON', async () => {
    mockLoadFile.mockResolvedValue('invalid json');

    await expect(processManifestTemplate(mockPath)).rejects.toThrow(TypeError);
    await expect(processManifestTemplate(mockPath)).rejects.toThrow(/Failed to parse manifest file/);
  });

  it('should throw error for missing environment variables', async () => {
    delete process.env.MISSING_VAR;
    mockLoadFile.mockResolvedValue('{"key": "{{MISSING_VAR}}"}');

    await expect(processManifestTemplate(mockPath)).rejects.toThrow(/Missing variable/);
  });
});

describe('uploadManifestTsk', () => {
  const mockCompressFilesToZip = compressFilesToZip as jest.MockedFunction<typeof compressFilesToZip>;
  const mockReadZipFileAsBuffer = readZipFileAsBuffer as jest.MockedFunction<typeof readZipFileAsBuffer>;
  const mockSaveToFile = saveToFile as jest.MockedFunction<typeof saveToFile>;
  const mockUnlink = unlink as jest.MockedFunction<typeof unlink>;
  const mockExecute = execute as jest.MockedFunction<typeof execute>;

  const zipPath = '/tmp/mapps-compress-test.zip';
  // biome-ignore lint/suspicious/noExplicitAny: Listr renderer generic is unused by uploadManifestTsk
  const taskStub = { output: '', title: '' } as unknown as ListrTaskWrapper<ImportCommandTasksContext, any>;

  beforeEach(() => {
    jest.spyOn(importManifestService, 'processManifestTemplate').mockResolvedValue({ name: 'test-app' });
    mockCompressFilesToZip.mockResolvedValue(zipPath);
    mockReadZipFileAsBuffer.mockReturnValue(Buffer.from('zip-bytes'));
    mockSaveToFile.mockResolvedValue();
    mockUnlink.mockResolvedValue();
    mockExecute.mockResolvedValue({} as Awaited<ReturnType<typeof execute>>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('unlinks the temp zip and processed manifest after a successful upload', async () => {
    const ctx = {
      manifestFilePath: '/project/manifest.json',
      allowMissingVariables: false,
      appId: 1 as const,
    };

    await uploadManifestTsk(ctx, taskStub);

    expect(mockUnlink).toHaveBeenCalledWith(zipPath);
    expect(mockUnlink).toHaveBeenCalledWith('/project/manifest.json.processed');
  });

  it('unlinks the temp zip and processed manifest when upload fails', async () => {
    mockExecute.mockRejectedValueOnce(new Error('upload failed'));

    const ctx = {
      manifestFilePath: '/project/manifest.json',
      allowMissingVariables: false,
    };

    await expect(uploadManifestTsk(ctx, taskStub)).rejects.toThrow('upload failed');

    expect(mockUnlink).toHaveBeenCalledWith(zipPath);
    expect(mockUnlink).toHaveBeenCalledWith('/project/manifest.json.processed');
  });
});
