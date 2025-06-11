module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/lib'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    '@emurgo/cardano-serialization-lib-browser': '<rootDir>/__mocks__/@emurgo/cardano-serialization-lib-browser.js',
  },
}
