function makeModuleNameMapper(srcPath, tsconfigPath) {
  // Get paths from tsconfig
  const tsConfig = require(tsconfigPath);
  const { paths } = tsConfig.compilerOptions;

  const aliases = {};

  // Iterate over paths and convert them into moduleNameMapper format
  Object.entries(paths).forEach(([item, itemPaths]) => {
    const key = `^${item.replace('/*', '/(.*)')}$`;
    const { jestPath, basePath } = srcPath[itemPaths[0].split('/')[1]];
    const path = paths[item][0].replace(basePath, '').replace('*', '$1');
    aliases[key] = jestPath + '/' + path;
  });
  return aliases;
}

const TS_CONFIG_PATH = './test/jest.tsconfig.json';
const SRC_PATH_MAPPING = {
  src: {jestPath: '<rootDir>/src', basePath: './src/'},
  test: {jestPath: '<rootDir>/test', basePath: './test/'},
};

module.exports = {
  moduleNameMapper: makeModuleNameMapper(SRC_PATH_MAPPING, TS_CONFIG_PATH),
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/test-setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/bin/', '/.github/', '/patches/', '/scripts/'],
  coverageReporters: ['json', 'lcov'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/types',
  ],
  clearMocks: true,
  testTimeout: 10000,
};
