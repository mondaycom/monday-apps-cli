import { processManifestTemplate } from 'services/import-manifest-service';
import { loadFile } from 'utils/file-system';

jest.mock('utils/file-system');

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
