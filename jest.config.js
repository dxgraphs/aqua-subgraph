module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>'],
  testPathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/', '<rootDir>/abis/', '<rootDir>/scripts/'],
  testTimeout: 30000,
  collectCoverage: true
}
