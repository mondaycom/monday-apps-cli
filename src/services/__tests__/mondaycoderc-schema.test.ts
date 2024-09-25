import { mondaycodercSchema } from 'services/schemas/mondaycoderc-schema';

describe('mondaycodercSchema Validation', () => {
  it('should validate a correct Python runtime and version', () => {
    const data = { RUNTIME: 'Python', RUNTIME_VERSION: '3.10.1' };
    expect(() => mondaycodercSchema.parse(data)).not.toThrow();
  });

  it('should invalidate an incorrect Python runtime version', () => {
    const data = { RUNTIME: 'Python', RUNTIME_VERSION: '2.7.0' };
    expect(() => mondaycodercSchema.parse(data)).toThrow('Invalid RUNTIME_VERSION for the specified RUNTIME');
  });

  it('should validate a correct Java runtime and version', () => {
    const data = { RUNTIME: 'Java', RUNTIME_VERSION: '17' };
    expect(() => mondaycodercSchema.parse(data)).not.toThrow();
  });

  it('should invalidate a missing runtime version when runtime is specified', () => {
    const data = { RUNTIME: 'Java' };
    expect(() => mondaycodercSchema.parse(data)).toThrow('Invalid RUNTIME_VERSION for the specified RUNTIME');
  });

  it('should validate when runtime is not specified', () => {
    const data = {};
    expect(() => mondaycodercSchema.parse(data)).not.toThrow();
  });

  it('should invalidate an incorrect Go runtime version', () => {
    const data = { RUNTIME: 'Go', RUNTIME_VERSION: '2.0.0' };
    expect(() => mondaycodercSchema.parse(data)).toThrow('Invalid RUNTIME_VERSION for the specified RUNTIME');
  });
});
