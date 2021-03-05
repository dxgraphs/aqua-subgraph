module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>'],
  testPathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/', '<rootDir>/abis/', '<rootDir>/scripts/'],
  testTimeout: 300000, // expect tests to take up to 5 minutes because subgraph indexing syncs
  collectCoverage: true
}
