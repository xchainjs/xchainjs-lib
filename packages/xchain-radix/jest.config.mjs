export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/lib'],
  testTimeout: 30000,
}
