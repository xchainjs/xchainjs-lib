export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/lib'],
  testTimeout: 60000,
  moduleNameMapper: {
    '@emurgo/cardano-serialization-lib-browser': '<rootDir>/__mocks__/@emurgo/cardano-serialization-lib-browser.js',
  },
}
